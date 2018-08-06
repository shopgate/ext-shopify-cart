const sinon = require('sinon')
const Logger = require('../../../lib/logger')
const httpCodeSuccess = 200
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
    const logSpy = sinon.spy(log, 'debug')

    logRequest.log(httpCodeSuccess, {}, {}, {})

    sinon.assert.calledWith(logSpy, sinon.match.has('duration'))
    sinon.assert.calledWith(logSpy, sinon.match.has('message'))
    sinon.assert.calledWith(logSpy, sinon.match.has('request'))
    sinon.assert.calledWith(logSpy, sinon.match.has('response'))
    sinon.assert.calledWith(logSpy, sinon.match({statusCode: httpCodeSuccess}))
  })
})
