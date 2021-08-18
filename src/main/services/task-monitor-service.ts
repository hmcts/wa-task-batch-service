import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {JobName} from '../model/job-names';
import Logger, {getLogLabel} from '../utils/logger';
import S2SService from './s2s-service';
import {exit} from '../utils/exit';

const BASE_URL: string = config.get('services.taskMonitor.url');
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
const s2sService: S2SService = S2SService.getInstance();

interface JobDetails {
  name: string;
  camundaMaxResults: string
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
    
    const camundaMaxResults: string =
      config.get('job.camundaMaxResults') == 'CAMUNDA_MAX_RESULTS'
        ? config.get('job.defaultCamundaMaxResults')
        : config.get('job.camundaMaxResults');
    
    const JOB_NAME: JobName = JobName[jobName as keyof typeof JobName];
    logger.trace(`Attempting to create job=${JOB_NAME} with camundaMaxResults=${camundaMaxResults}`, logLabel);
    return this.createTaskJob(JobName[JOB_NAME], camundaMaxResults);
  }

  private createTaskJob(job: JobName, camundaMaxResults: string): Promise<void> {
    const jobRequest: MonitorTaskJobRequest = { job_details: { name: job , camundaMaxResults: camundaMaxResults} };
    
    return s2sService.getServiceToken().then(s2sToken => {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers: any = {ServiceAuthorization: s2sToken};
      return taskMonitorApi.post('/monitor/tasks/jobs', jobRequest, {headers}).then(resp => {
        logger.trace(`Status: ${resp.status}`, logLabel);
        logger.trace(`Response: ${JSON.stringify(resp.data)}`, logLabel);
      }).catch(err => {
        logger.exception(err, logLabel);
        exit(1);
      });
    });
  }
}
