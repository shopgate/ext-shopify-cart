const Message = require('../models/messages/message')
const Tools = require('../lib/tools')

module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  let resultMessages = []

  /**
   *
   * @param {string} cartId
   * @return {*}
   */
  let removeCoupons = function (cartId) {
    let data = {}
    if (Array.isArray(input.couponCodes)) {
      data = {
        'checkout': {
          'discount_code': null
        }
      }
    } else {
      let message = new Message()
      message.type = message.TYPE_ERROR
      message.message = 'No coupon(s) given'
      message.code = '404'
      resultMessages.push(message.toJson())
      return cb(null, {messages: resultMessages})
    }

    Shopify.put('/admin/checkouts/' + cartId + '.json', data, function (err, data) {
      let success = true
      if (err) {
        Object.keys(data.errors).map(function (objectKey) {
          const messages = data.errors[objectKey]
          const len = messages.length
          for (let i = 0; i < len; i++) {
            const message = new Message()
            message.addErrorMessage(messages[i]['code'], messages[i]['message'])
            resultMessages.push(message.toJson())
          }
        })
        success = false
      }
      if (success) return cb(null, null)
      return cb(null, {messages: resultMessages})
    })
  }

  Tools.getCurrentCartId(context, (err, cartId) => {
    if (err) cb(err)
    removeCoupons(cartId)
  })
}
