import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {JobName} from '../model/job-names';
import Logger, {getLogLabel} from '../utils/logger';
import S2SService from './s2s-service';
import {exit} from '../utils/exit';
import {getHttpRequestFailureMessage, sanitiseHttpUrl} from '../utils/http-logging';

const BASE_URL: string = config.get('services.taskMonitor.url');
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
const s2sService: S2SService = S2SService.getInstance();

interface JobDetails {
  name: string;
}

interface MonitorTaskJobRequest {
  job_details: JobDetails;
}

const taskMonitorApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class TaskMonitorService {
  public async createJob(): Promise<void> {
    const jobName: string = config.get('job.name');
    logger.trace(`environment variable job.name value is ${jobName}`, logLabel);
    const JOB_NAME: JobName = JobName[jobName as keyof typeof JobName];
    logger.trace(`Attempting to create a job for task ${JOB_NAME}`, logLabel);
    return this.createTaskJob(JobName[JOB_NAME]);
  }

  private createTaskJob(job: JobName): Promise<void> {
    const jobRequest: MonitorTaskJobRequest = {'job_details': {name: job}};
    return s2sService.getServiceToken().then(s2sToken => {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers: any = {ServiceAuthorization: s2sToken};
      const startedAt = Date.now();
      logger.trace(`HTTP request started operation=task-monitor-create-job method=POST url=${sanitiseHttpUrl('/monitor/tasks/jobs', BASE_URL)} timeoutMs=30000 jobName=${job}`, logLabel);
      return taskMonitorApi.post('/monitor/tasks/jobs', jobRequest, {headers}).then(resp => {
        logger.trace(`HTTP request completed operation=task-monitor-create-job status=${resp.status} durationMs=${Date.now() - startedAt}`, logLabel);
        logger.trace(`Response: ${JSON.stringify(resp.data)}`, logLabel);
      }).catch(err => {
        logger.exception(getHttpRequestFailureMessage({
          operation: 'task-monitor-create-job',
          startedAt,
          error: err,
        }), logLabel);
        exit(1);
      });
    });
  }
}
