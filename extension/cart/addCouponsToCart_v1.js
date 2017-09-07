const Message = require('../models/messages/message')
const Tools = require('../lib/tools')

/**
 *
 * @typedef {object} input
 * @property {Array} couponCodes
 *
 * @param context
 * @param {object} input
 * @param cb
 */
module.exports = function (context, input, cb) {
  const Shopify = require('../lib/shopify.api.js')(context.config)
  let resultMessages = []

  /**
   *
   * @param {string} cartId
   * @return {*}
   */
  let addCoupons = function (cartId) {
    let data = {}
    if (Array.isArray(input.couponCodes)) {
      const coupon = input.couponCodes[0]
      data = {
        'checkout': {
          'discount_code': coupon
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
    addCoupons(cartId)
  })
}
