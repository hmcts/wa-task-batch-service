import * as config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import {Application} from 'express';
import {get, has, set} from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);

      this.setSecret('secrets.wa.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
      this.setSecret('secrets.wa.s2s-secret-task-monitor', 's2s.secret');
    }
  }

  private setSecret(fromPath: string, toPath: string): void {
    if (has(config, fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }

}
