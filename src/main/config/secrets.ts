import config from 'config';
import {get, has, set} from 'lodash';

const setSecret = (secretPath: string, configPath: string): void => {
  // Only overwrite the value if the secretPath is defined
  if (has(config, secretPath)) {
    set(config, configPath, get(config, secretPath));
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setupSecrets = () => {
  setSecret('secrets.wa.s2s-secret-task-monitor', 's2s.secret');
  return config;
};

export {
  setupSecrets,
};
