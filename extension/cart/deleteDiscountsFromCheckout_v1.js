const Tools = require('../lib/tools')

const InvalidCallError = require('../models/Errors/InvalidCallError')
const Message = require('../models/messages/message')

/**
 * @typedef {Object} input
 * @property {String[]} discountCodes
 *
 * @param {Object} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  removeDiscounts(input.checkout, input.discountCodes)

  /**
   * @param {Object} checkout
   * @param {String[]} discountCodes
   */
  function removeDiscounts (checkout, discountCodes) {
    const Shopify = require('../lib/shopify.api.js')(context.config, context.log)
    const checkoutToken = checkout.token

    if (Tools.isEmpty(discountCodes) || !Array.isArray(discountCodes) || !discountCodes[0]) {
      console.log.error('Error: Wrong parameter format or no discount (coupon) codes given.')
      return cb(new InvalidCallError())
    }

    /*
     * INFO: This step doesn't actually care about if one of the given discount codes matches with the discount
     * in the checkout. It just deletes the current one, if any is present.
     * It just returns without error if nothing is there to delete
     */
    if (!checkout.discount_code) {
      return cb()
    }

    Shopify.setCheckoutDiscount(checkoutToken, null, (err, data) => {
      let resultMessages = []
      if (err) {
        Object.keys(data.errors).map(function (objectKey) {
          for (let message of data.errors[objectKey]) {
            const messageModel = new Message()
            messageModel.addErrorMessage(message['code'], message['message'])
            resultMessages.push(message.toJson())
          }
        })

        return cb(null, {messages: resultMessages})
      }

      return cb()
    })
  }
}
