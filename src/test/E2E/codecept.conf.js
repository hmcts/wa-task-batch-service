'use strict';

const { TEST_E2E_URL, E2E_TEST_TIME_TO_WAIT_FOR_TEXT } = require('./config');

exports.config = {
  tests: './paths/**/*.js',
  output: '../../functional-output',
  helpers: {
    Puppeteer: {
      url: TEST_E2E_URL,
      show: false,
      waitForTimeout: E2E_TEST_TIME_TO_WAIT_FOR_TEXT * 1000,
      getPageTimeout: E2E_TEST_TIME_TO_WAIT_FOR_TEXT * 1000,
      waitForNavigation: ['domcontentloaded'],
      chrome: {
        headless: true,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--enable-automation'],
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--allow-running-insecure-content',
          '--ignore-certificate-errors',
          '--window-size=1280,960',
        ],
      },
    },
  },
  include: {
    I: './pages/steps.js',
  },
  mocha: {
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: './functional-output',
      reportFilename: 'e2e-report',
    },
  },
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
  },
};
