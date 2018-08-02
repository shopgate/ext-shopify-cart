module.exports = class {
  constructor (context, request) {
    this.context = context
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
    this.context.log.debug(logResult)
  }
}
