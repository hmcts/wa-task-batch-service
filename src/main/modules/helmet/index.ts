import * as express from 'express';
import config from 'config';
import { helmet } from 'helmet';

export interface HelmetConfig {
  referrerPolicy: string;
}

const googleAnalyticsDomain = '*.google-analytics.com';
const self = "'self'";
const helmetConfig: HelmetConfig = config.get('security');

/**
 * Module that enables helmet in the application
 */
export class Helmet {

  public enableFor(app: express.Express): void {
    // include default helmet functions
    app.use(helmet());

    this.setContentSecurityPolicy(app);
    this.setReferrerPolicy(app, helmetConfig.referrerPolicy);
  }

  private setContentSecurityPolicy(app: express.Express): void {
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          'connect-src': [self],
          'default-src': ["'none'"],
          'font-src': [self, 'data:'],
          'img-src': [self, googleAnalyticsDomain],
          'object-src': [self],
          'script-src': [self, googleAnalyticsDomain, "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='"],
          'style-src': [self],
        },
      }),
    );
  }

  private setReferrerPolicy(app: express.Express, policy: string): void {
    if (!policy) {
      throw new Error('Referrer policy configuration is required');
    }

    helmet({
      referrerPolicy: {
        policy: 'no-referrer',
      },
    });
  }
}
