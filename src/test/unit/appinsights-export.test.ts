import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { ExportResultCode } from '@opentelemetry/core';

interface TelemetryEnvelope {
  tags: Record<string, string>;
  data: {
    baseType: string;
    baseData: {
      message?: string;
      name?: string;
      id?: string;
      data?: string;
      resultCode?: string;
      exceptions?: { message: string; typeName: string }[];
      metrics?: { name: string; value: number }[];
    };
  };
}

interface TelemetryResult {
  envelopes: TelemetryEnvelope[];
  spanContext: { traceId: string; spanId: string };
  failure: { code: ExportResultCode; statusCode: number; requestIntercepted: boolean };
  dependencyIntercepted: boolean;
  winstonMetadata: { trace_id: string; span_id: string };
}

describe('AppInsights export integration', () => {
  let result: TelemetryResult;

  beforeAll(async () => {
    const { stdout } = await promisify(execFile)(process.execPath, [
      path.join(__dirname, 'fixtures/appinsights-export.cjs'),
    ], {
      cwd: path.resolve(__dirname, '../../..'),
      timeout: 15000,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        NODE_CONFIG: JSON.stringify({ appInsights: { enabled: true } }),
        APPLICATIONINSIGHTS_CONNECTION_STRING: 'InstrumentationKey=00000000-0000-0000-0000-000000000001;IngestionEndpoint=https://telemetry.example.test/;LiveEndpoint=https://live.example.test/',
        APPLICATION_INSIGHTS_NO_STATSBEAT: 'true',
        APPLICATIONINSIGHTS_STATSBEAT_DISABLED: 'true',
        OTEL_NODE_RESOURCE_DETECTORS: 'none',
        HTTPS_PROXY: '',
        HTTP_PROXY: '',
        ALL_PROXY: '',
      },
    });
    const resultLine = stdout.split('\n').find(line => line.startsWith('TELEMETRY_RESULT='));
    expect(resultLine).toBeDefined();
    result = JSON.parse(resultLine.slice('TELEMETRY_RESULT='.length));
  }, 20000);

  it('exports activation logs, spans, and metrics with the configured service role', () => {
    const { envelopes, spanContext } = result;

    const activation = envelopes.find(envelope => envelope.data.baseData.message === 'App insights activated');
    const span = envelopes.find(envelope => envelope.data.baseData.name === 'telemetry-export-span');
    const metric = envelopes.find(envelope => envelope.data.baseData.metrics?.some(item => item.name === 'telemetry_export_counter'));

    expect(activation?.data.baseType).toBe('MessageData');
    expect(span?.data.baseType).toBe('RemoteDependencyData');
    expect(spanContext.traceId).toMatch(/^[a-f0-9]{32}$/);
    expect(spanContext.traceId).not.toBe('0'.repeat(32));
    expect(spanContext.spanId).toMatch(/^[a-f0-9]{16}$/);
    expect(span?.tags['ai.operation.id']).toBe(spanContext.traceId);
    expect(span?.data.baseData.id).toContain(spanContext.spanId);
    expect(metric?.data.baseData.metrics).toContainEqual(expect.objectContaining({ name: 'telemetry_export_counter', value: 7 }));
    for (const envelope of [activation, span, metric]) {
      expect(envelope?.tags['ai.cloud.role']).toBe('wa-task-batch-service');
    }
  });

  it('reports rejected telemetry through the real Azure exporter callback', () => {
    expect(result.failure).toEqual({
      code: ExportResultCode.FAILED,
      statusCode: 400,
      requestIntercepted: true,
    });
  });

  it('automatically exports outgoing HTTP dependencies', () => {
    const dependency = result.envelopes.find(envelope =>
      envelope.data.baseType === 'RemoteDependencyData'
      && envelope.data.baseData.data === 'http://dependency.example.test/health');

    expect(result.dependencyIntercepted).toBe(true);
    expect(dependency?.data.baseData.resultCode).toBe('200');
    expect(dependency?.tags['ai.cloud.role']).toBe('wa-task-batch-service');
    expect(dependency?.tags['ai.operation.id']).toMatch(/^[a-f0-9]{32}$/);
  });

  it('correlates existing Winston 2 logs with the active trace', () => {
    expect(result.winstonMetadata).toEqual(expect.objectContaining({
      trace_id: result.spanContext.traceId,
      span_id: result.spanContext.spanId,
    }));
  });

  it('exports collected exceptions with their error type and service role', () => {
    const exception = result.envelopes.find(envelope =>
      envelope.data.baseType === 'ExceptionData'
      && envelope.data.baseData.exceptions?.some(error => error.message === 'telemetry-export-exception'));

    expect(exception?.data.baseData.exceptions).toContainEqual(expect.objectContaining({
      message: 'telemetry-export-exception',
      typeName: 'TypeError',
    }));
    expect(exception?.tags['ai.cloud.role']).toBe('wa-task-batch-service');
  });
});
