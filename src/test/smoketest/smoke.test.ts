const { spawn } = require('child_process');

test('should check if server process is running', async () => {
  const serverProcess = spawn('yarn', ['start:dev'], { shell: true, stdio: 'pipe' });

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

  // Clean up the server process
  serverProcess.kill();
});

