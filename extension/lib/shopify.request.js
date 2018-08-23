const querystring = require('querystring')
const https = require('https')

module.exports = class {
  constructor (config, logger) {
    this.config = config
    this.logger = logger
  }
  get (endpoint, data) {
    endpoint += '?' + querystring.stringify(data)
    return (this.makeRequest(endpoint, 'GET', data))
  }
  getHostName () {
    return this.config.shop.split('.')[0] + '.myshopify.com'
  }
  makeRequest (endpoint, method, data) {
    const dataString = JSON.stringify(data)
    const options = {
      hostname: this.getHostName(),
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
    if (options.method === 'post' || options.method === 'put' || options.method === 'delete' || options.method === 'patch') {
      options.headers['Content-Length'] = Buffer.alloc(dataString).length
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
              const json = JSON.parse(body)
              resolve(json)
            }
          } catch (err) {
            return reject(err)
          }
        })
      })

      request.on('error', function (err) {
        return reject(err)
      })

      request.end()
    })
  }
}
