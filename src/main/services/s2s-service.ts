import axios, {AxiosResponse} from 'axios';
import Logger, {getLogLabel} from '../utils/logger';
import config from 'config';

const otp = require(('otp'));
const s2sSecret: string = config.get('s2s.secret');
const s2sUrl: string = config.get('s2s.url');
const microServiceName: string = config.get('s2s.microserviceName');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

//eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IS2SService {
  buildRequest: () => {};
  requestServiceToken: () => void;
  getServiceToken: () => {};
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
   * Assembles a serviceAuthProvider request object to be used to query the service
   * also creates a one-time-password from the secret.
   */
  buildRequest() {

    const uri = `${s2sUrl}/lease`;
    const oneTimePassword = otp({secret: s2sSecret}).totp();

    return {
      uri: uri,
      body: {
        microservice: microServiceName,
        oneTimePassword: oneTimePassword,
      },
    };
  }

  /**
   * Sends out a request to the serviceAuthProvider and request a new service token
   * to be passed as a header in any outgoing calls.
   * Note: This token is stored in memory and this token is only valid for 3 hours.
   */
  async requestServiceToken() {
    logger.trace('Attempting to request a S2S token', logLabel);
    const request = this.buildRequest();
    try {
      const response: AxiosResponse = await axios.post(request.uri, request.body);
      if (response && response.data) {
        logger.trace('Received S2S token', logLabel);
        return response.data;
      }
    } catch (err) {
      logger.exception('Could not retrieve S2S token', logLabel);
      logger.exception(err, logLabel);
    }
  }

  async getServiceToken() {
    const serviceToken = await this.requestServiceToken();
    return `Bearer ${serviceToken}`;
  }

}
