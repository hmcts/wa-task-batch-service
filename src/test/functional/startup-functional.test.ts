import axios, {AxiosInstance} from 'axios';
import {spawn, ChildProcess} from 'child_process';
import S2SService from '../../main/services/s2s-service';
// import config from 'config';
let serverProcess: ChildProcess;

// const BASE_URL: string = config.get('services.taskMonitor.url');
const BASE_URL: string = 'http://wa-task-monitor-aat.service.core-compute-aat.internal';
const JOB_REQUEST = {job_details: {name: 'INITIATION'}};
const s2sService: S2SService = S2SService.getInstance();

const taskMonitorApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

beforeAll(() => {
  console.log('Starting the server process', process.env.NODE_ENV);

  serverProcess = spawn('yarn', ['start'], {
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, ALLOW_CONFIG_MUTATIONS: true.toString()},
  });
});

afterAll(() => {
  // Clean up the server process
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
});

test('should check if server process is running', async () => {
  let output = '';

  serverProcess.stdout.on('data', (data: Buffer) => {
    output += data.toString();
  });

  serverProcess.stderr.on('data', (data: Buffer) => {
    output += data.toString();
  });

  // Wait for some time to let the server start
  await new Promise((resolve) => setTimeout(resolve, 30000));

  const s2sToken = await s2sService.getServiceToken();
  s2sService.getServiceToken().then(s2sToken => {
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const headers: any = {ServiceAuthorization: s2sToken};
        taskMonitorApi.post('/monitor/tasks/jobs', JOB_REQUEST, {headers});
        });

//   const headers = {ServiceAuthorization: s2sToken};
//   await

  console.log('Output log', output);
  expect(output).toContain('Application started');
  expect(output).toContain('Received S2S token');
  expect(output).toContain('Status: 200');
  expect(output).toContain('Response: {"job_details":{"name":"INITIATION"}}');
}, 60000);
