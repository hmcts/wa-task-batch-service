import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {JobName} from '../model/job-names';
import Logger, {getLogLabel} from '../utils/logger';
import S2SService from './s2s-service';

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
  public async createJob(jobName: JobName): Promise<void> {
    logger.trace(`Attempting to create a job for task ${jobName}`, logLabel);
    return this.createTaskJob(jobName);
  }

  private createTaskJob(job: JobName): Promise<void> {
    const jobRequest: MonitorTaskJobRequest = {'job_details': {name: job}};
    return s2sService.getServiceToken().then(s2sToken => {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers: any = {ServiceAuthorization: s2sToken};
      return taskMonitorApi.post('/monitor/tasks/jobs', jobRequest, {headers}).then(resp => {
        logger.trace(`Status: ${resp.status}`, logLabel);
        logger.trace(`Response: ${JSON.stringify(resp.data)}`, logLabel);
      }).catch(err => {
        logger.exception(err, logLabel);
      });
    });
  }
}
