'use strict';

const { TEST_FRONT_END_URL, E2E_TEST_TIME_TO_WAIT_FOR_TEXT } = require('../config');

module.exports = function () {
  return actor({
    openApp() {
      this.amOnPage(TEST_FRONT_END_URL);
    },
    waitForLandingText(text) {
      this.waitForTextInDom(text, E2E_TEST_TIME_TO_WAIT_FOR_TEXT);
    },
  });
};
