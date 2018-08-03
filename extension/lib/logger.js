module.exports = class {
  constructor (logger, request) {
    this.logger = logger
    this.request = request
    this.start = new Date()
  }
  log (statusCode, headers, response, options) {
    const logResult = {
      duration: new Date() - this.start,
      statusCode,
      request: {
        request: this.request,
        options
      },
      response: {
        headers,
        body: response
      },
      message: 'Request to Shopify'
    }
    this.logger.debug(logResult)
  }
}
