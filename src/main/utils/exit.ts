import Logger, {getLogLabel} from './logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

/**
 * Exits the application to mark containers as completed or failed.
 * @param exitCode 0 for success, 1 for success.
 */
export function exit(exitCode: number): void {
  logger.trace(`Job will now exit with code ${exitCode}`, logLabel);
  process.exit(exitCode);
}
