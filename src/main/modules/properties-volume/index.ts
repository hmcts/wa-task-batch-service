import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import {get, set} from 'lodash';

export class PropertiesVolume {

  enableFor(): void {

    propertiesVolume.addTo(config);

    this.setSecret('secrets.wa.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
    this.setSecret('secrets.wa.s2s-secret-task-monitor', 's2s.secret');


    set(config, 'appInsights.instrumentationKey', get(config, 'secrets.wa.AppInsightsInstrumentationKey'));
    set(config, 's2s.secret', get(config, 'secrets.wa.s2s-secret-task-monitor'));
    set(config, 'secrets.wa.s2s-secret-task-monitor', get(config, 's2s.secret'));

    const s2sSecretFromVolume = get(config, 'wa.secrets.s2s-secret-task-monitor');
    const s2sSecretFromEnv = process.env.S2S_SECRET_TASK_MONITOR;

    console.log('S2S secret from volume:', s2sSecretFromVolume ? '[FOUND]' : '[NOT FOUND]');
    console.log('S2S secret from env:', s2sSecretFromEnv ? '[FOUND]' : '[NOT FOUND]');

  }

  private setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }
}
