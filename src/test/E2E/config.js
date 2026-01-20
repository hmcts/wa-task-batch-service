'use strict';

const TEST_E2E_URL = process.env.TEST_E2E_URL || process.env.TEST_FRONT_END_URL || 'http://localhost:9999';
const TEST_FRONT_END_URL = process.env.TEST_FRONT_END_URL || TEST_E2E_URL;
const E2E_TEST_TIME_TO_WAIT_FOR_TEXT = Number.parseInt(process.env.E2E_TEST_TIME_TO_WAIT_FOR_TEXT, 10) || 10;

module.exports = {
  TEST_E2E_URL,
  TEST_FRONT_END_URL,
  E2E_TEST_TIME_TO_WAIT_FOR_TEXT,
};
