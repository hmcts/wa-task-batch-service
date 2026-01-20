'use strict';

const http = require('http');
const { spawn } = require('child_process');

const BASE_ENV = {
  NODE_ENV: 'production',
  PORT: '0',
  ALLOW_CONFIG_MUTATIONS: 'true',
  JOB_NAME: 'INITIATION',
  S2S_SECRET_TASK_MONITOR: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
  S2S_MICROSERVICE_NAME_TASK_MONITOR: 'wa-task-monitor',
};

function parseBody(body) {
  if (!body) {
    return null;
  }
  try {
    return JSON.parse(body);
  } catch (err) {
    return body;
  }
}

function startMockServer(handler) {
  return new Promise(resolve => {
    const requests = [];
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const record = {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: parseBody(body),
        };
        requests.push(record);
        handler(record, res);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        url: `http://127.0.0.1:${address.port}`,
        requests,
        close: () => new Promise(closeResolve => server.close(closeResolve)),
      });
    });
  });
}

function runTaskMonitorJob(envOverrides, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'node',
      ['-r', 'ts-node/register', 'src/main/server.ts'],
      {
        env: {
          ...process.env,
          ...BASE_ENV,
          ...envOverrides,
        },
        stdio: ['ignore', 'ignore', 'pipe'],
      }
    );

    let stderr = '';
    child.stderr.on('data', data => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Timed out waiting for task job process. ${stderr}`));
    }, timeoutMs);

    child.on('error', err => {
      clearTimeout(timeout);
      reject(err);
    });

    child.on('exit', code => {
      clearTimeout(timeout);
      resolve({ code, stderr });
    });
  });
}

module.exports = {
  BASE_ENV,
  startMockServer,
  runTaskMonitorJob,
};
