import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {JobName} from "../model/job-names";
import Logger, {getLogLabel} from "../utils/logger";
import S2SService from "./s2s-service";

const BASE_URL: string = config.get('services.taskMonitor.url');
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
const s2sService: S2SService = S2SService.getInstance();

const taskMonitorApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export class TaskMonitorService {
  public createJob(jobName: JobName) {
    logger.trace(`Attempting to create a job for task ${jobName}`, logLabel)
    this.createTaskJob(jobName);
  }

  private createTaskJob(job: JobName) {
    const jobRequest: MonitorTaskJobRequest = {job_details: {name: job}};
    s2sService.getServiceToken().then(s2sToken => {
      const headers: any = {ServiceAuthorization: s2sToken};
      taskMonitorApi.post("/monitor/tasks/jobs", jobRequest, {headers}).then(resp => {
        logger.trace(`Status: ${resp.status}`, logLabel)
        logger.trace(`Response: ${JSON.stringify(resp.data)}`, logLabel)
      }).catch(err => {
        logger.exception(err, logLabel);
      });
    });

  }
}
