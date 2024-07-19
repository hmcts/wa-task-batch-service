import { spawn, ChildProcess } from 'child_process';
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

  // Wait for some time to let the server start
  await new Promise((resolve) => setTimeout(resolve, 30000));

  console.log('Output log', output);
  expect(output).toContain('Application started');
}, 80000);
