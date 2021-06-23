import * as propertiesVolume from '@hmcts/properties-volume';
import config from 'config';
import {get, has, set} from 'lodash';

propertiesVolume.addTo(config);

const setSecret = (secretPath: string, configPath: string) => {
  // Only overwrite the value if the secretPath is defined
  if (has(config, secretPath)) {
    set(config, configPath, get(config, secretPath));
  }
};

const setupSecrets = () => {
  setSecret('secrets.wa.s2s-secret-task-monitor', 's2s.secret');
  return config;
};

export {
  setupSecrets
};
