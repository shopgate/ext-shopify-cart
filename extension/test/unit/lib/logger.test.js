const sinon = require('sinon')
const Logger = require('../../../lib/logger')
const statusCodeSuccess = 200
let logRequest
const log = {
  debug: (message) => {
  }
}

describe('Logger', () => {

  beforeEach(() => {
    logRequest = new Logger(log, {})
  });

  it('should log the status code, duration, request and response', () => {
    const expectedLogObject = {
      duration: 0,
      message: 'Request to Shopify',
      request: {options:{}, request:{}},
      response: {body:{}, headers:{}},
      statusCode: statusCodeSuccess
    }

    const logSpy = sinon.spy(log, 'debug')

    logRequest.log(statusCodeSuccess, {}, {}, {})
    sinon.assert.calledWith(logSpy, expectedLogObject)
  })
})
