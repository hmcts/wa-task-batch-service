// startup-functional.test.ts
import {ChildProcess, spawn} from 'child_process';

let serverProcess: ChildProcess;
const maskSecret = (value?: string): string => value ? `${value.slice(0, 3)}***` : '[NOT FOUND]';

beforeAll(() => {
  console.log('Starting the server process');

  serverProcess = spawn('yarn', ['start'], {
    shell: true,
    stdio: 'pipe',
    env: {
      ...process.env,
      ALLOW_CONFIG_MUTATIONS: 'true',
      NODE_ENV: 'development',
    },
  });
});

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
});

test('should verify server starts, gets S2S token, and calls task monitor', async () => {
  let output = '';
  console.log(
    'S2S secret present in test env:',
    process.env.S2S_SECRET_TASK_MONITOR ? '[FOUND]' : '[NOT FOUND]',
  );
  console.log(
    'S2S secret first 3 in test env:',
    maskSecret(process.env.S2S_SECRET_TASK_MONITOR),
  );

  console.log(
    'Environment :',
    process.env.NODE_ENV ,
  );

  serverProcess.stdout?.on('data', (data: Buffer) => {
    output += data.toString();
  });

  serverProcess.stderr?.on('data', (data: Buffer) => {
    output += data.toString();
  });

  // Wait for the server to start and complete its job
  await new Promise((resolve) => setTimeout(resolve, 30000));

  console.log('Output log', output);

  expect(output).toContain('Application started');
  expect(output).toContain('Received S2S token');
  expect(output).toContain('Status: 200');
  expect(output).toContain('Response: {"job_details":{"name":"INITIATION"}}');
}, 60000);
