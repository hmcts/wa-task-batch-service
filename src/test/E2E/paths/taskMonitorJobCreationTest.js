'use strict';

const assert = require('assert');
const { startMockServer, runTaskMonitorJob, BASE_ENV } = require('../helpers/task-monitor-flow');

Feature('Task monitor job');

Scenario('creates a job via task monitor', async () => {
  let jobRequest;
  const s2sServer = await startMockServer((request, res) => {
    if (request.method === 'POST' && request.url === '/lease') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('token-123');
      return;
    }

    res.statusCode = 404;
    res.end();
  });

  const taskMonitorServer = await startMockServer((request, res) => {
    if (request.method === 'POST' && request.url === '/monitor/tasks/jobs') {
      jobRequest = request;
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.statusCode = 404;
    res.end();
  });

  try {
    const result = await runTaskMonitorJob({
      S2S_URL: s2sServer.url,
      WA_TASK_MONITOR_SERVICE_URL: taskMonitorServer.url,
    });

    assert.strictEqual(result.code, 0, result.stderr || 'Expected exit code 0');
    assert.ok(jobRequest, 'Expected job creation request');
    assert.deepStrictEqual(jobRequest.body, {
      job_details: {
        name: BASE_ENV.JOB_NAME,
      },
    });
    assert.strictEqual(jobRequest.headers.serviceauthorization, 'Bearer token-123');
  } finally {
    await s2sServer.close();
    await taskMonitorServer.close();
  }
});
