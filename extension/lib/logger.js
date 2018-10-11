module.exports = class {
  /**
   * @param {context.log} logger The extension's context.log object.
   */
  constructor (logger) {
    this.logger = logger
  }

  /**
   * @param {object} requestOptions
   * @param {object} response A response object of the "request" module
   */
  log (requestOptions, response = {}) {
    const logRequest = Object.assign({}, requestOptions)
    const logResponse = response === null ? {} : Object.assign({}, response)

    if (logResponse.body && typeof logResponse.body !== 'string') {
      logResponse.body = JSON.stringify(logResponse.body)
    }

    if (logRequest.body && typeof logRequest.body !== 'string') {
      logRequest.body = JSON.stringify(logRequest.body)
    }

    this.logger.debug({
      duration: logResponse.elapsedTime || 0,
      statusCode: logResponse.statusCode || 0,
      request: logRequest,
      response: {
        headers: logResponse.headers || {},
        body: logResponse.body
      },
      msg: 'Request to Shopify'
    })
  }
}
