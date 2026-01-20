'use strict';

const { TEST_E2E_URL, E2E_TEST_TIME_TO_WAIT_FOR_TEXT } = require('./config');

exports.config = {
  tests: './paths/**/*.js',
  output: '../../output',
  helpers: {
    Puppeteer: {
      url: TEST_E2E_URL,
      show: false,
      windowSize: '1280x720',
      waitForTimeout: E2E_TEST_TIME_TO_WAIT_FOR_TEXT * 1000,
    },
    JSWait: {
      require: './helpers/JSWait.js',
    },
  },
  include: {
    I: './pages/steps.js',
  },
  mocha: {
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: './output',
      reportFilename: 'e2e-report',
    },
  },
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
  },
};
