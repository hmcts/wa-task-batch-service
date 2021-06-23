import {glob} from 'glob';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import {Helmet} from './modules/helmet';
import * as path from 'path';
import {HTTPError} from 'HttpError';
import {PropertiesVolume} from './modules/properties-volume';
import {AppInsights} from './modules/appinsights';
import {JobName} from "./model/job-names";
import {TaskMonitorService} from "./services/task-monitor-service";
import S2SService from "./services/s2s-service";

const {Logger} = require('@hmcts/nodejs-logging');

import config = require('config');

const {setupDev} = require('./development');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

export const app = express();
app.locals.ENV = env;

const logger = Logger.getLogger('app');

new PropertiesVolume().enableFor(app);
new AppInsights().enable();
new Helmet(config.get('security')).enableFor(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );
  next();
});

glob.sync(__dirname + '/routes/**/*.+(ts|js)')
  .map(filename => require(filename))
  .forEach(route => route.default(app));

setupDev(app, developmentMode);
// returning "not found" page for requests with paths not resolved by the router
app.use((req, res) => {
  res.status(404);
});

// error handler
app.use((err: HTTPError, req: express.Request, res: express.Response) => {
  logger.error(`${err.stack || err}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === 'development' ? err : {};
  res.status(err.status || 500);
});

const s2s = S2SService.getInstance();
app.locals.s2s = s2s;

new TaskMonitorService().createJob(JobName.CONFIGURATION);
