const querystring = require('querystring')
const BigJSON = require('json-bigint')
const https = require('https')
const Logger = require('./logger')

module.exports = class {
  /**
   * @param {Object} config
   * @param {config.log} logger
   */
  constructor (config, logger) {
    this.config = config
    this.logger = logger
  }
  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise}
   */
  get (endpoint, data) {
    endpoint += '?' + querystring.stringify(data)
    return (this.makeRequest(endpoint, 'GET', data))
  }
  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise}
   */
  put (endpoint, data) {
    return (this.makeRequest(endpoint, 'PUT', data))
  }
  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise}
   */
  post (endpoint, data) {
    return (this.makeRequest(endpoint, 'POST', data))
  }
  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise}
   */
  delete (endpoint, data) {
    return (this.makeRequest(endpoint, 'DELETE', data))
  }
  /**
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise}
   */
  patch (endpoint, data) {
    return (this.makeRequest(endpoint, 'PATCH', data))
  }

  /**
   * @param {string} endpoint
   * @param {string} method
   * @param {Object} data
   * @returns {Promise}
   */
  makeRequest (endpoint, method, data) {
    const logRequest = new Logger(this.logger, data)
    const dataString = BigJSON.stringify(data)
    const options = {
      hostname: this.config.shop,
      path: endpoint,
      method: method.toLowerCase() || 'get',
      port: 443,
      agent: this.config.agent,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    if (this.config.access_token) {
      options.headers['X-Shopify-Access-Token'] = this.config.access_token
    }

    if (!this.isGetMethod(options)) {
      options.headers['Content-Length'] = Buffer.from(dataString).length
    }

    return new Promise((resolve, reject) => {
      const request = https.request(options, function (response) {
        response.setEncoding('utf8')
        let body = ''
        response.on('data', (chunk) => {
          body += chunk
        }).on('end', () => {
          try {
            if (body.trim() !== '') {
              const json = BigJSON.parse(body)
              logRequest.log(response.statusCode, options.headers, json, options)
              resolve(json)
            } else {
              logRequest.log(response.statusCode, options.headers, '', options)
              reject(new Error('Empty response given'))
            }
          } catch (err) {
            reject(err)
          }
        })
      })

      request.on('error', (err) => {
        reject(err)
      })

      if (!this.isGetMethod(options)) {
        request.write(dataString)
      }

      request.end()
    })
  }

  /**
   * @param {Object} options
   * @returns {Boolean}
   */
  isGetMethod (options) {
    return options.method === 'get'
  }
}
