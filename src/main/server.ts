#!/usr/bin/env node
import {app} from './app';
import {TaskMonitorService} from './services/task-monitor-service';
import {exit} from './utils/exit';

import {logger} from '@hmcts/nodejs-logging';

const logger = Logger.getLogger('server');
// TODO: set the right port for your application
const port: number = parseInt(process.env.PORT, 10) || 9999;

app.listen(port, () => {
  logger.info(`Application started: http://localhost:${port}`);
});

new TaskMonitorService().createJob().then(() => exit(0));
