import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import {get, set} from 'lodash';

export class PropertiesVolume {

  enableFor(): void {

    propertiesVolume.addTo(config);

    set(config, 'appInsights.instrumentationKey', get(config, 'secrets.wa.AppInsightsInstrumentationKey'));
    set(config, 's2s.secret', get(config, 'secrets.wa.s2s-secret-task-monitor'));
  }
}
