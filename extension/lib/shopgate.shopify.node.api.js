const BigJSON = require('json-bigint')

module.exports = function () {
  module.makeRequest = function (endpoint, method, data, callback, retry) {
    const https = require('https')
    const dataString = JSON.stringify(data)
    const options = {
      hostname: this.hostname(),
      path: endpoint,
      method: method.toLowerCase() || 'get',
      port: this.port(),
      agent: this.config.agent,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    let self = this

    if (this.config.access_token) {
      options.headers['X-Shopify-Access-Token'] = this.config.access_token
    }

    if (options.method === 'post' || options.method === 'put' || options.method === 'delete' || options.method === 'patch') {
      options.headers['Content-Length'] = Buffer.from(dataString).length
    }

    const request = https.request(options, function (response) {
      self.conditional_console_log('STATUS: ' + response.statusCode)
      self.conditional_console_log('HEADERS: ' + JSON.stringify(response.headers))

      if (response.headers && response.headers.http_x_shopify_shop_api_call_limit) {
        self.conditional_console_log('API_LIMIT: ' + response.headers.http_x_shopify_shop_api_call_limit)
      }

      response.setEncoding('utf8')

      let body = ''

      response.on('data', function (chunk) {
        self.conditional_console_log('BODY: ' + chunk)
        body += chunk
      })

      response.on('end', function () {
        let delay = 0

        // If the request is being rate limited by Shopify, try again after a delay
        if (response.statusCode === 429) {
          return setTimeout(function () {
            self.makeRequest(endpoint, method, data, callback)
          }, self.config.rate_limit_delay || 10000)
        }

        // If the backoff limit is reached, add a delay before executing callback function
        if ((response.statusCode >= 200 || response.statusCode <= 299) && self.has_header(response, 'http_x_shopify_shop_api_call_limit')) {
          const apiLimit = parseInt(response.headers['http_x_shopify_shop_api_call_limit'].split('/')[0], 10)
          if (apiLimit >= (self.config.backoff || 35)) delay = self.config.backoff_delay || 1000
        }

        setTimeout(function () {
          let json = {}
          let error
          let jsonError

          try {
            if (body.trim() !== '') {
              json = BigJSON.parse(body)
            }
          } catch (e) {
            error = e
          }
          if (response.statusCode >= 400) {
            if (json && (json.hasOwnProperty('error_description') || json.hasOwnProperty('error') || json.hasOwnProperty('errors'))) {
              jsonError = (json.error_description || json.error || json.errors)
            }
            error = {
              code: response.statusCode, error: jsonError || response.statusMessage
            }
          }

          callback(error, json, response.headers, options, response.statusCode)
        }, delay)
      })
    })

    request.on('error', function (e) {
      self.conditional_console_log('Request Error: ', e)
      if (self.config.retry_errors && !retry) {
        const delay = self.config.error_retry_delay || 10000
        self.conditional_console_log('retrying once in " + delay + " milliseconds')
        setTimeout(function () {
          self.makeRequest(endpoint, method, data, callback, true)
        }, delay)
      } else {
        callback(e)
      }
    })

    if (options.method === 'post' || options.method === 'put' || options.method === 'delete' || options.method === 'patch') {
      request.write(dataString)
    }

    request.end()
  }

  return module
}
