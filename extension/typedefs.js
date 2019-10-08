/**
 * @typedef {Object} SDKContext
 * @property {ExtensionConfig} config
 * @property {SDKContextMeta} meta
 * @property {SDKContextStorage} storage
 * @property {SDKContextLog} log
 * @property {Function} tracedRequest
 */

/**
 * @typedef {Object} ExtensionConfig
 * @property {string} shopifyShopAlias
 * @property {string} shopifyShopDomain
 * @property {string} shopifyAccessToken
 * @property {string} userRegistrationUrl
 * @property {string} userDataCacheTtl
 * @property {string} stage
 * @property {Object} credentials
 * @property {string} credentials.baseDomain
 * @property {string} credentials.clientId
 * @property {string} credentials.clientSecret
 * @property {string} credentials.refreshToken
 * @property {Object} requestTimeout
 * @property {number} requestTimeout.token
 * @property {number} requestTimeout.bigApi
 */

/**
 * @typedef {Object} SDKContextMeta
 * @property {string} deviceId
 * @property {string} appId
 * @property {string} userId
 * @property {string} appLanguage
 */

/**
 * @typedef {Object} SDKContextStorage
 * @property {SDKContextEntityStorage} extension
 * @property {SDKContextEntityStorage} device
 * @property {SDKContextEntityStorage} user
 */

/**
 * @typedef {Object} SDKContextEntityStorage
 * @property {Function} get - (string key, Function cb)
 * @property {Function} set - (string key, mixed value, Function cb)
 * @property {Function} del - (string key, Function cb)
 * @property {Object} map
 * @property {Function} map.get - (string mapName)
 * @property {Function} map.set - (string mapName, Object map)
 * @property {Function} map.del - (string mapName)
 * @property {Function} map.getItem - (string mapName, string key)
 * @property {Function} map.setItem - (string mapName, string key, string value)
 * @property {Function} map.delItem - (string mapName, string key)
 */

/**
 * @typedef {Object} SDKContextLog
 * @property {Function} trace
 * @property {Function} debug
 * @property {Function} info
 * @property {Function} warn
 * @property {Function} error
 * @property {Function} fatal
 */
