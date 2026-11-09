import config from 'config';
import { logs, SeverityNumber } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { AppInsights } from '../../main/modules/appinsights';
import { enableExceptionTracking } from '../../main/modules/appinsights/exceptions';

jest.mock('config', () => ({ get: jest.fn() }));
jest.mock('@azure/monitor-opentelemetry', () => ({
  useAzureMonitor: jest.fn(),
  shutdownAzureMonitor: jest.fn(),
}));
jest.mock('../../main/modules/appinsights/exceptions', () => ({ enableExceptionTracking: jest.fn() }));
jest.mock('@opentelemetry/resources', () => ({
  resourceFromAttributes: jest.fn(attributes => ({ attributes })),
}));
jest.mock('@opentelemetry/api', () => ({
  logs: { getLogger: jest.fn() },
  SeverityNumber: { INFO: 9 },
}));

describe('AppInsights', () => {
  const mockGet = jest.mocked(config.get);
  const mockUseAzureMonitor = jest.mocked(useAzureMonitor);
  const mockGetLogger = jest.mocked(logs.getLogger);
  const mockResourceFromAttributes = jest.mocked(resourceFromAttributes);
  const emit = jest.fn();
  const originalConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    mockGet.mockImplementation(key => key === 'appInsights.enabled' ? true : 'test-key');
    mockGetLogger.mockReturnValue({ emit, enabled: () => true });
    mockResourceFromAttributes.mockImplementation(attributes => ({ attributes }) as ReturnType<typeof resourceFromAttributes>);
  });

  afterAll(() => {
    if (originalConnectionString === undefined) {
      delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    } else {
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = originalConnectionString;
    }
  });

  it.each([false, 'true', undefined])('does not initialize when enabled is %p', enabled => {
    mockGet.mockReturnValue(enabled);

    new AppInsights().enable();

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('appInsights.enabled');
    expect(mockUseAzureMonitor).not.toHaveBeenCalled();
    expect(enableExceptionTracking).not.toHaveBeenCalled();
    expect(mockGetLogger).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('initializes telemetry with live metrics, full sampling, and the service role', () => {
    new AppInsights().enable();

    expect(mockResourceFromAttributes).toHaveBeenCalledWith({ 'service.name': 'wa-task-batch-service' });
    expect(mockUseAzureMonitor).toHaveBeenCalledTimes(1);
    expect(mockUseAzureMonitor).toHaveBeenCalledWith({
      azureMonitorExporterOptions: { connectionString: 'InstrumentationKey=test-key' },
      enableLiveMetrics: true,
      resource: mockResourceFromAttributes.mock.results[0].value,
      samplingRatio: 1,
      tracesPerSecond: 0,
      instrumentationOptions: {
        bunyan: { enabled: true },
        winston: { enabled: true },
      },
    });
    expect(enableExceptionTracking).toHaveBeenCalledWith(
      mockGetLogger.mock.results[0].value,
      expect.any(Function),
    );
    expect(mockGetLogger).toHaveBeenCalledWith('wa-task-batch-service');
    expect(emit).toHaveBeenCalledWith({ body: 'App insights activated', severityNumber: SeverityNumber.INFO });
  });

  it('prefers the environment connection string over the configured instrumentation key', () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'InstrumentationKey=environment-key;IngestionEndpoint=https://example.test/';

    new AppInsights().enable();

    expect(mockUseAzureMonitor).toHaveBeenCalledWith(expect.objectContaining({
      azureMonitorExporterOptions: { connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING },
    }));
  });

  it('preserves a complete connection string supplied through existing configuration', () => {
    const connectionString = 'InstrumentationKey=configured-key;IngestionEndpoint=https://example.test/';
    mockGet.mockImplementation(key => key === 'appInsights.enabled' ? true : connectionString);

    new AppInsights().enable();

    expect(mockUseAzureMonitor).toHaveBeenCalledWith(expect.objectContaining({
      azureMonitorExporterOptions: { connectionString },
    }));
  });

  it('propagates initialization errors without reporting successful activation', () => {
    const error = new Error('Telemetry initialization failed');
    mockUseAzureMonitor.mockImplementation(() => { throw error; });

    expect(() => new AppInsights().enable()).toThrow(error);
    expect(mockGetLogger).not.toHaveBeenCalled();
    expect(enableExceptionTracking).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
