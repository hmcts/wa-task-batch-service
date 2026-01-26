import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import {Application} from 'express';
import {get, set} from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);

      set(config, 'appInsights.instrumentationKey', get(config, 'secrets.wa.AppInsightsInstrumentationKey'));
      set(config, 's2s.secret', get(config, 'secrets.wa.s2s-secret-task-monitor'));
    }
  }
}
