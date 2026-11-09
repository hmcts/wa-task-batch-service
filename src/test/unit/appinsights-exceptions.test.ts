import {Logger, SeverityNumber} from '@opentelemetry/api';
import {enableExceptionTracking} from '../../main/modules/appinsights/exceptions';

describe('Application Insights exception collection', () => {
  const emit = jest.fn();
  const logger: Logger = {emit, enabled: () => true};
  let flush: jest.Mock<Promise<void>>;
  let on: jest.SpyInstance;
  let exit: jest.SpyInstance;

  const handler = (event: string): ((reason: unknown) => void) => on.mock.calls.find(call => call[0] === event)[1];
  const settle = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    emit.mockReset();
    flush = jest.fn().mockResolvedValue(undefined);
    on = jest.spyOn(process, 'on').mockReturnValue(process);
    jest.spyOn(process, 'removeListener').mockReturnValue(process);
    jest.spyOn(process, 'listeners').mockReturnValue([jest.fn()]);
    exit = jest.spyOn(process, 'exit').mockImplementation(((): void => undefined) as never);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    enableExceptionTracking(logger, flush);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('exports rejected errors as exception telemetry without flushing or exiting', () => {
    const error = new TypeError('Job failed');
    handler('unhandledRejection')(error);

    expect(emit).toHaveBeenCalledWith({
      severityNumber: SeverityNumber.ERROR,
      body: 'Job failed',
      attributes: {
        'exception.type': 'TypeError',
        'exception.message': 'Job failed',
        'exception.stacktrace': error.stack,
      },
    });
    expect(flush).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('normalizes non-Error rejection reasons', () => {
    handler('unhandledRejection')('Job failed');

    expect(emit).toHaveBeenCalledWith(expect.objectContaining({
      attributes: expect.objectContaining({'exception.type': 'Error', 'exception.message': 'Job failed'}),
    }));
  });

  it('limits exception exports to fifty per minute and refills at the boundary', () => {
    const reject = handler('unhandledRejection');
    for (let index = 0; index < 51; index++) {
      reject(new Error('Repeated failure'));
    }
    expect(emit).toHaveBeenCalledTimes(50);

    jest.advanceTimersByTime(59999);
    reject(new Error('Still limited'));
    expect(emit).toHaveBeenCalledTimes(50);

    jest.advanceTimersByTime(1);
    reject(new Error('New window'));
    expect(emit).toHaveBeenCalledTimes(51);
  });

  it('always exports a terminal exception and flushes before exiting with failure', async () => {
    for (let index = 0; index < 50; index++) {
      handler('unhandledRejection')(new Error('Repeated failure'));
    }
    handler('uncaughtException')(new Error('Terminal failure'));

    expect(emit).toHaveBeenCalledTimes(51);
    expect(exit).not.toHaveBeenCalled();
    await settle();
    expect(flush).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(expect.objectContaining({message: 'Terminal failure'}));
  });

  it.each(['reject', 'throw'])('still exits when flushing fails by %s', async mode => {
    const error = new Error('Exporter unavailable');
    if (mode === 'reject') {
      flush.mockRejectedValue(error);
    } else {
      flush.mockImplementation(() => { throw error; });
    }
    handler('uncaughtException')(new Error('Terminal failure'));

    await settle();
    expect(flush).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('leaves exit handling to existing uncaught exception listeners', async () => {
    jest.mocked(process.listeners).mockReturnValue([jest.fn(), jest.fn()]);
    handler('uncaughtException')(new Error('Handled elsewhere'));

    await settle();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(flush).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('still flushes and exits when recording a terminal exception throws', async () => {
    emit.mockImplementation(() => { throw new Error('Recording failed'); });
    handler('uncaughtException')(new Error('Terminal failure'));

    await settle();
    expect(console.error).toHaveBeenCalledWith('Could not record exception telemetry', expect.objectContaining({message: 'Recording failed'}));
    expect(flush).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('removes only its own listeners during cleanup', () => {
    const cleanup = enableExceptionTracking(logger, flush);
    cleanup();

    expect(process.removeListener).toHaveBeenCalledWith('uncaughtException', on.mock.calls[2][1]);
    expect(process.removeListener).toHaveBeenCalledWith('unhandledRejection', on.mock.calls[3][1]);
  });
});
