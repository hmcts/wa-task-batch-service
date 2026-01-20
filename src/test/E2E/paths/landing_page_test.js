'use strict';

const { E2E_TEST_TIME_TO_WAIT_FOR_TEXT } = require('../config');

Feature('Landing page');

Scenario('open landing page and see welcome text', ({ I }) => {
  const welcomeText = 'Welcome to the Task reconfiguration Service REST';
  I.openApp();
  I.waitForTextInDom(welcomeText, E2E_TEST_TIME_TO_WAIT_FOR_TEXT);
  I.see(welcomeText);
});
