#!/usr/bin/env node
import * as https from 'https';
import {app} from './app';
import {TaskMonitorService} from './services/task-monitor-service';
import {exit} from './utils/exit';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('server');
// TODO: set the right port for your application
const port: number = parseInt(process.env.PORT, 10) || 9999;

if (app.locals.ENV === 'development') {
  const sslOptions = {};
  const server = https.createServer(sslOptions, app);
  server.listen(port, () => {
    logger.info(`Application started: https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    logger.info(`Application started: http://localhost:${port}`);
  });
}

new TaskMonitorService().createJob().then(() => exit(0));
