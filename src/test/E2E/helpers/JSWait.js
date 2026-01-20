'use strict';

const { Helper } = require('codeceptjs');

class JSWait extends Helper {
  async waitForTextInDom(text, timeoutSeconds = 10) {
    const { page } = this.helpers.Puppeteer;
    await page.waitForFunction(
      (expected) => document.body && document.body.innerText.includes(expected),
      { timeout: timeoutSeconds * 1000 },
      text
    );
  }
}

module.exports = JSWait;
