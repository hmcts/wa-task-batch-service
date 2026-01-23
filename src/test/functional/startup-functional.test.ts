import {spawn, ChildProcess} from 'child_process';
import {TaskMonitorService} from '../../main/services/task-monitor-service';

const taskMonitorService = new TaskMonitorService();

let serverProcess: ChildProcess;

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

  await taskMonitorService.createJob();

  console.log('Output log', output);
  expect(output).toContain('Application started');
  expect(output).toContain('Received S2S token');
  expect(output).toContain('Status: 200');
  expect(output).toContain('Response: {"job_details":{"name":"INITIATION"}}');
}, 60000);
