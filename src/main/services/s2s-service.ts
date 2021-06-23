import axios from 'axios';
import {setupSecrets} from "../config/secrets";
import Logger, {getLogLabel} from "../utils/logger";

const otp = require(("otp"))
const config = setupSecrets();

const s2sSecret: string = config.get('s2s.secret');
const s2sUrl: string = config.get('s2s.url');
const microServiceName: string = config.get('s2s.microserviceName');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

interface IS2SService {
  buildRequest: () => {};
  requestServiceToken: () => void;
  setServiceToken: (token: string) => void;
  getServiceToken: () => {};
}

export default class S2SService implements IS2SService {
  private static instance: S2SService;
  private serviceToken: string;

  public static getInstance(): S2SService {
    if (!S2SService.instance) {
      S2SService.instance = new S2SService();
    }
    return S2SService.instance;
  }

  constructor() {
    this.init()
      .catch(ex => logger.exception(ex, logLabel));
  }

  async init() {
    await this.requestServiceToken();
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
        oneTimePassword: oneTimePassword
      }
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
    await axios.post(request.uri, request.body).then(res => {
      if (res && res.data) {
        this.serviceToken = res.data;
        logger.trace('Received S2S token and stored token', logLabel);
      } else {
        logger.exception('Could not retrieve S2S token', logLabel);
      }
    }).catch(err => {
      logger.exception(err, logLabel);
    });
  }

  async getServiceToken() {
    if (this.serviceToken === undefined) {
      await this.requestServiceToken();
    }
    return `Bearer ${this.serviceToken}`;
  }

  setServiceToken(token: string) {
    this.serviceToken = token;
  }
}
