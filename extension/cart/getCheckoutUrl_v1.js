const Url = require('../models/url')

/**
 * @typedef {Object} context
 * @property {Object} config
 *
 * @typedef {Object} config
 * @property {String} shopifyShopDomain
 */

/**
 *
 * @param {Object} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  // limit expiry time to two hours from "now", because we don't have any info about the real expiry time
  const date = new Date()
  date.setTime(date.getTime() + 1000 * 60 * 60 * 2)
  const expires = date.toISOString()

  // We need to replace the web_url from data.checkout with the shopifyShopDomain from our config
  const shopifyShopDomain = context.config.shopifyShopDomain
  const newShopifyShopDomain = input.checkout.web_url.replace(/(https:\/\/checkout\.shopify\.com)/, shopifyShopDomain)

  return cb(null, new Url(newShopifyShopDomain, expires))
}
