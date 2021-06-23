import chalk from 'chalk';

enum SEVERITY {
  REQUEST = 0,
  TRACE = 1,
  EXCEPTION = 3
}

interface ILogger {
  exception: (message: string, label: string) => void;
  request: (message: string, label: string) => void;
  trace: (message: string, label: string) => void;
}

export default class Logger implements ILogger {

  request(message: string, label: string) {
    this.console(message, label, SEVERITY.REQUEST);
  }

  trace(message: string, label: string) {
    this.console(message, label, SEVERITY.TRACE);
  }

  exception(message: string, label: string) {
    this.console(message, label, SEVERITY.EXCEPTION);
  }

  console(message: string, label: string, severity?: number) {
    const log: string = `[${label}]: ${message}`;
    switch (severity) {
      case SEVERITY.REQUEST:
        // tslint:disable:no-console
        console.log(chalk.white(`Request: ${log}`));
        break;
      case SEVERITY.TRACE:
        console.warn(chalk.green(`Info: ${log} `));
        break;
      case SEVERITY.EXCEPTION:
        console.error(chalk.red(`Exception: ${log}`));
        break;
      default:
        break;
    }
  }
}

export function getLogLabel(path: string) {
  let paths: string[];
  paths = path.split('\\').pop().split('/');
  return paths[paths.length - 2] + '/' + paths[paths.length - 1];
}
