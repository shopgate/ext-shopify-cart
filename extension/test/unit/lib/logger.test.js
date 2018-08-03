const sinon = require('sinon')

const Logger = require('../../../lib/logger')
const context = {
  log: {
    debug: (message) => {
    }
  }
}
const statusCodeSuccess = 200
let logRequest

describe('Logger', () => {

  beforeEach(() => {
    logRequest = new Logger(context, {})
  });

  it('should log the status code, duration, request and response', () => {
    const expectedLogObject = {
      duration: 0,
      message: 'Request to Shopify',
      request: {options:{}, request:{}},
      response: {body:{}, headers:{}},
      statusCode: statusCodeSuccess
    }

    const logSpy = sinon.spy(context.log, 'debug')

    logRequest.log(statusCodeSuccess, {}, {}, {})
    sinon.assert.calledWith(logSpy, expectedLogObject)
  })
})
