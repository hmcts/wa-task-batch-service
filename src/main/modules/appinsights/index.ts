import config from 'config';

const appInsights = require('applicationinsights');
const appInsightsEnabled: boolean = config.get('appInsights.enabled');
const appInsightsKey: string = config.get('appInsights.instrumentationKey');

export class AppInsights {

  enable(): void {
    if (appInsightsEnabled && appInsightsEnabled === true) {
      appInsights.setup(appInsightsKey)
        .setSendLiveMetrics(true)
        .start();

      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'wa-task-batch-service';
      appInsights.defaultClient.trackTrace({message: 'App insights activated'});
    }
  }

}
