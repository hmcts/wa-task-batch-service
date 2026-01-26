import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import {Application} from 'express';
import {get, set} from 'lodash';

const maskSecret = (value?: string): string => value ? `${value.slice(0, 3)}***` : '[NOT FOUND]';

export class PropertiesVolume {

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);

      set(config, 'appInsights.instrumentationKey', get(config, 'secrets.wa.AppInsightsInstrumentationKey'));
      set(config, 's2s.secret', get(config, 'secrets.wa.s2s-secret-task-monitor'));

      const s2sSecretFromEnv = process.env.S2S_SECRET_TASK_MONITOR;
      const s2sSecretFromConfig = get(config, 's2s.secret') as string | undefined;
      console.log('S2S secret first 3 from env:', maskSecret(s2sSecretFromEnv));
      console.log('S2S secret first 3 from config:', maskSecret(s2sSecretFromConfig));
    }
  }
}
