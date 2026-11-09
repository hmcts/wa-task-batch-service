import {Logger, SeverityNumber} from '@opentelemetry/api';

const exceptionLimit = 50;
const exceptionWindowMillis = 60000;

/** Retains Application Insights exception collection and flushes before a fatal exit. */
export function enableExceptionTracking(logger: Logger, flush: () => Promise<void>): () => void {
  let remaining = exceptionLimit;
  let windowStarted = Date.now();

  const track = (reason: unknown, terminal: boolean): void => {
    if (Date.now() - windowStarted >= exceptionWindowMillis) {
      remaining = exceptionLimit;
      windowStarted = Date.now();
    }
    const error = reason instanceof Error ? reason : new Error(String(reason));
    if (terminal || remaining > 0) {
      if (!terminal) {
        remaining--;
      }
      try {
        logger.emit({
          severityNumber: SeverityNumber.ERROR,
          body: error.message,
          attributes: {
            'exception.type': error.name,
            'exception.message': error.message,
            'exception.stacktrace': error.stack || error.message,
          },
        });
      } catch (telemetryError) {
        console.error('Could not record exception telemetry', telemetryError);
      }
    }
    if (terminal) {
      const exit = (): never => {
        console.error(error);
        return process.exit(1);
      };
      void Promise.resolve().then(flush).then(exit, exit);
    }
  };

  const onException = (error: Error): void => track(error, process.listeners('uncaughtException').length === 1);
  const onRejection = (reason: unknown): void => track(reason, false);
  process.on('uncaughtException', onException);
  process.on('unhandledRejection', onRejection);

  return () => {
    process.removeListener('uncaughtException', onException);
    process.removeListener('unhandledRejection', onRejection);
  };
}
