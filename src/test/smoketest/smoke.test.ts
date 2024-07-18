import { spawn, ChildProcess } from 'child_process';
let serverProcess: ChildProcess;

test('should check if server process is running', async () => {
  serverProcess = spawn('yarn', ['start:conditional'], {
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
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('Output log', output);
  expect(output).toContain('Application started');
});

afterAll(() => {
  // Clean up the server process
  if (serverProcess) {
    serverProcess.kill();
  }
});
