/**
 * @param {ExtensionConfig} config
 */
function getBaseUrl (config) {
  const url = config.shopifyShopDomain || 'https://' + config.shopifyShopAlias + '.myshopify.com'
  return url.replace(/\/$/, '')
}

/**
 * @param {ExtensionConfig} config
 * @returns {string|null} The upper-cased country code or null if not configured.
 */
function getCountryCode (config) {
  const countryCode = (config.countryCode || '').trim().toUpperCase()
  return countryCode || null
}

module.exports = {
  getBaseUrl,
  getCountryCode
}
