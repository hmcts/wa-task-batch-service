import config from 'config';
import {shutdownAzureMonitor, useAzureMonitor} from '@azure/monitor-opentelemetry';
import {logs, SeverityNumber} from '@opentelemetry/api';
import {resourceFromAttributes} from '@opentelemetry/resources';
import {enableExceptionTracking} from './exceptions';

export class AppInsights {

  enable(): void {
    if (config.get<boolean>('appInsights.enabled') !== true) {
      return;
    }

    const serviceName = 'wa-task-batch-service';
    const configuredKey = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
      || config.get<string>('appInsights.instrumentationKey');
    const connectionString = configuredKey.includes('=')
      ? configuredKey : `InstrumentationKey=${configuredKey}`;

    useAzureMonitor({
      azureMonitorExporterOptions: {connectionString},
      enableLiveMetrics: true,
      samplingRatio: 1,
      tracesPerSecond: 0,
      instrumentationOptions: {
        bunyan: {enabled: true},
        winston: {enabled: true},
      },
      resource: resourceFromAttributes({'service.name': serviceName}),
    });
    const logger = logs.getLogger(serviceName);
    enableExceptionTracking(logger, shutdownAzureMonitor);
    logger.emit({
      body: 'App insights activated',
      severityNumber: SeverityNumber.INFO,
    });
  }

}
