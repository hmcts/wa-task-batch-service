import { spawn, ChildProcess } from 'child_process';
let serverProcess: ChildProcess;

test('should check if server process is running', async () => {
  console.log('Starting the server process');
  const nodeEnv = process.env.NODE_ENV;
  console.log(`NODE_ENV: ${nodeEnv}`);
  serverProcess = spawn('yarn', ['start'], {
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, ALLOW_CONFIG_MUTATIONS: true.toString()},
  });
  let output = '';

  serverProcess.stdout.on('data', (data: Buffer) => {
    output += data.toString();
  });

  serverProcess.stderr.on('data', (data: Buffer) => {
    output += data.toString();
  });

  // Wait for some time to let the server start
  await new Promise((resolve) => setTimeout(resolve, 60000));

  console.log('Output log', output);
  expect(output).toContain('Application started');
}, 80000);

afterAll(() => {
  // Clean up the server process
  if (serverProcess) {
    serverProcess.kill();
  }
});
