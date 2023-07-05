import winston, { format, Logform } from 'winston';
import { get, StackFrame } from 'stack-trace';

import config from '@config/config';
import { LogLevelType } from '@types';

import packageJson from '../../package.json';

class Logger {
  private readonly logger: winston.Logger;

  private readonly serviceName: string;
  private readonly serviceVersion: string;

  constructor() {
    this.serviceName = packageJson.name || 'Service name is not defined';
    this.serviceVersion = packageJson.version || 'Service version is not defined';

    let formatter: Logform.Format;
    if (config.env.toLocaleLowerCase() === 'local') {
      formatter = format.combine(format.timestamp(), format.json(), format.prettyPrint());
    } else {
      format.combine(format.timestamp(), format.json());
    }

    this.logger = winston.createLogger({
      level: 'debug',
      format: formatter,
      exitOnError: false,
      transports: [
        new winston.transports.Http({
          host: config.dataDogHost,
          path: `v1/input/${config.dataDogApiKey || ''}?ddsource=nodejs&service=${config.dataDogService || ''}`,
          ssl: true,
        }),
        new winston.transports.Console(),
      ],
    });
  }

  public send(logLevel: LogLevelType, logInfo: unknown) {
    switch (logLevel) {
      case 'error':
        this.error(logInfo);
        break;
      case 'info':
        this.info(logInfo);
        break;
      case 'warn':
        this.warn(logInfo);
        break;
      default:
        this.logger.info(logInfo);
        break;
    }
  }

  private parseInfo(logInfo: unknown) {
    type intoType = { [key: string]: any };
    let parsedInfo: intoType = {};
    if (logInfo instanceof Error) {
      const error = {
        message: logInfo.message,
        stack: logInfo.stack,
      };
      parsedInfo.error = error;
    } else if (typeof logInfo === 'string') {
      parsedInfo.message = logInfo;
    } else if (typeof logInfo === 'object') {
      parsedInfo = { ...logInfo };
    }
    return {
      ...parsedInfo,
      ...this.getCallerInformation(),
      env: config.env,
    };
  }

  public info(logInfo: unknown) {
    this.logger.info(this.parseInfo(logInfo));
  }
  public error(logInfo: unknown) {
    this.logger.error(this.parseInfo(logInfo));
  }
  public warn(logInfo: unknown) {
    this.logger.warn(this.parseInfo(logInfo));
  }

  private getCallerInformation() {
    const stack: StackFrame[] = get();
    const fileName = stack[3].getFileName() || stack[2].getFileName();
    const line = stack[3].getLineNumber() || stack[2].getLineNumber();
    return {
      file: fileName,
      line,
      serviceName: this.serviceName,
      serviceVersion: this.serviceVersion,
    };
  }
}

export default new Logger();
