import Logger, {getLogLabel} from "./logger";

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export function exit(): void {
  const exitCode = 0;
  logger.trace(`Job will now exit with code ${exitCode}`, logLabel)
  process.exit(exitCode)
}
