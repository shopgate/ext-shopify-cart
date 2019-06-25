const Url = require('../models/url')
const ConfigHelper = require('../helper/config')

/**
 * @typedef {Object} context
 * @property {Object} config
 *
 * @typedef {Object} config
 * @property {String} shopifyShopAlias
 * @property {String} shopifyShopDomain
 */
/**
 *
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async (context, input) => {
  // limit expiry time to two hours from "now", because we don't have any info about the real expiry time
  const date = new Date()
  date.setTime(date.getTime() + 1000 * 60 * 60 * 2)
  const expires = date.toISOString()

  // We need to replace the web_url from data.checkout with the shopify shop domain (using the alias from our config)
  const checkoutDomain = input.checkout.web_url.replace(context.config.shopifyShopAlias + '.myshopify.com', ConfigHelper.getHostName(context.config))

  return new Url(checkoutDomain, expires)
}
