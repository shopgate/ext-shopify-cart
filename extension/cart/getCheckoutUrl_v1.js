const Url = require('../models/url')

/**
 * @typedef {Object} context
 * @property {Object} config
 *
 * @typedef {Object} config
 * @property {String} shopifyShopAlias
 */

/**
 *
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  // limit expiry time to two hours from "now", because we don't have any info about the real expiry time
  const date = new Date()
  date.setTime(date.getTime() + 1000 * 60 * 60 * 2)
  const expires = date.toISOString()

  // We need to replace the web_url from data.checkout with the shopify shop domain (using the alias from our config)
  const shopDomain = 'https://' + context.config.shopifyShopAlias + '.myshopify.com'
  const checkoutDomain = input.checkout.web_url.replace(/(https:\/\/checkout\.shopify\.com)/, shopDomain)

  return new Url(checkoutDomain, expires)
}
