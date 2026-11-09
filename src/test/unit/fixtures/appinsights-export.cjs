const nock = require('nock');

nock.disableNetConnect();
const envelopes = [];
const dependencyRequest = nock('http://dependency.example.test')
  .get('/health')
  .reply(200, 'healthy');
const rejectedRequest = nock('https://rejected.example.test')
  .post(/\/v2(?:\.1)?\/track/)
  .reply(400, { error: { code: 'BadRequest', message: 'Telemetry rejected for test' } });
nock('https://telemetry.example.test')
  .persist()
  .post(/\/v2(?:\.1)?\/track/)
  .reply(200, (_uri, body) => {
    envelopes.push(...(Array.isArray(body) ? body : JSON.parse(body)));
    return { itemsReceived: 1, itemsAccepted: 1, errors: [] };
  });
nock('https://live.example.test')
  .persist()
  .post(/.*/)
  .reply(200, '', { 'x-ms-qps-subscribed': 'false' });

require('ts-node/register');
const { AppInsights } = require('../../../main/modules/appinsights');
const { context, trace, metrics } = require('@opentelemetry/api');
const { shutdownAzureMonitor } = require('@azure/monitor-opentelemetry');

async function run() {
  new AppInsights().enable();
  const span = trace.getTracer('telemetry-export-test').startSpan('telemetry-export-span');
  const spanContext = span.spanContext();
  metrics.getMeter('telemetry-export-test').createCounter('telemetry_export_counter').add(7);
  const winston = require('winston');
  const logger = new winston.Logger({ transports: [new winston.transports.Console()] });
  const winstonMetadata = await new Promise(resolve => {
    logger.once('logging', (_transport, _level, _message, metadata) => resolve(metadata));
    context.with(trace.setSpan(context.active(), span), () => logger.info('telemetry-export-winston-message'));
  });
  span.end();
  process.emit('unhandledRejection', new TypeError('telemetry-export-exception'));
  const http = require('node:http');
  await new Promise((resolve, reject) => {
    http.get('http://dependency.example.test/health', response => {
      response.resume();
      response.on('end', resolve);
      response.on('error', reject);
    }).on('error', reject);
  });
  logger.close();
  await shutdownAzureMonitor();

  const { TracerProvider } = require('@opentelemetry/sdk-trace');
  const { AzureMonitorTraceExporter } = require('@azure/monitor-opentelemetry-exporter');
  let endedSpan;
  const provider = new TracerProvider({
    spanProcessors: [{
      onStart() {},
      onEnd(readableSpan) { endedSpan = readableSpan; },
      async forceFlush() {},
      async shutdown() {},
    }],
  });
  provider.getTracer('telemetry-error-test').startSpan('rejected-span').end();
  const exporter = new AzureMonitorTraceExporter({
    connectionString: 'InstrumentationKey=00000000-0000-0000-0000-000000000001;IngestionEndpoint=https://rejected.example.test/',
    disableOfflineStorage: true,
  });
  const exportResult = await new Promise(resolve => exporter.export([endedSpan], resolve));
  await Promise.all([exporter.shutdown(), provider.shutdown()]);
  const failure = {
    code: exportResult.code,
    statusCode: exportResult.error?.statusCode,
    requestIntercepted: rejectedRequest.isDone(),
  };
  nock.cleanAll();
  process.stdout.write(`TELEMETRY_RESULT=${JSON.stringify({ envelopes, spanContext, failure, winstonMetadata, dependencyIntercepted: dependencyRequest.isDone() })}\n`);
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
