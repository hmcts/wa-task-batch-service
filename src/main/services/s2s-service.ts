import axios, {AxiosResponse} from 'axios';
import Logger, {getLogLabel} from '../utils/logger';
import config from 'config';
import {exit} from '../utils/exit';
import {getHttpRequestFailureMessage, sanitiseHttpUrl} from '../utils/http-logging';

import {authenticator} from 'otplib';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

interface IS2SService {
  requestServiceToken: () => Promise<string>;
  getServiceToken: () => Promise<string>;
}

//eslint-disable @typescript-eslint/explicit-function-return-type
export default class S2SService implements IS2SService {
  private static instance: S2SService;

  public static getInstance(): S2SService {
    if (!S2SService.instance) {
      S2SService.instance = new S2SService();
    }
    return S2SService.instance;
  }

  /**
   * Sends out a request to the serviceAuthProvider and request a new service token
   * to be passed as a header in any outgoing calls.
   * Note: This token is stored in memory and this token is only valid for 3 hours.
   */
  async requestServiceToken(): Promise<string> {
    const url: string = config.get('s2s.url') + '/lease';
    const secret: string = config.get('s2s.secret');
    const microservice: string = config.get('s2s.microserviceName');

    const oneTimePassword = authenticator.generate(secret);
    const body = {microservice, oneTimePassword};
    const startedAt = Date.now();
    logger.trace(`Attempting to request a S2S token operation=s2s-token method=POST url=${sanitiseHttpUrl(url)} timeoutMs=none`, logLabel);

    try {
      const response: AxiosResponse = await axios.post(url, body);
      if (response && response.data) {
        logger.trace(`Received S2S token operation=s2s-token status=${response.status} durationMs=${Date.now() - startedAt}`, logLabel);
        return response.data;
      }
    } catch (err) {
      logger.exception(getHttpRequestFailureMessage({
        operation: 's2s-token',
        startedAt,
        error: err,
      }), logLabel);
      exit(1);
    }
  }

  async getServiceToken(): Promise<string> {
    const serviceToken = await this.requestServiceToken();
    return `Bearer ${serviceToken}`;
  }

}
