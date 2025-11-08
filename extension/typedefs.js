/**
 * @typedef SDKContext
 * @property {ExtensionConfig} config
 * @property {SDKContextMeta} meta
 * @property {SDKContextStorage} storage
 * @property {{ getInfo: function }} device
 * @property {SDKContextLog} log
 * @property {Function} tracedRequest
 */

/**
 * @typedef ExtensionConfig
 * @property {string} shopifyShopAlias
 * @property {string} shopifyShopDomain
 * @property {string} shopifyAccessToken
 * @property {string} shopifyHeadlessStorefrontAccessToken
 * @property {string} shopifyMultipassToken
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
 * @typedef SDKContextMeta
 * @property {string} deviceId
 * @property {string} appId
 * @property {string} userId
 * @property {string} appLanguage
 */

/**
 * @typedef SDKContextStorage
 * @property {SDKContextEntityStorage} extension
 * @property {SDKContextEntityStorage} device
 * @property {SDKContextEntityStorage} user
 */

/**
 * @typedef SDKContextEntityStorage
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
 * @typedef SDKContextLog
 * @property {Function} trace
 * @property {Function} debug
 * @property {Function} info
 * @property {Function} warn
 * @property {Function} error
 * @property {Function} fatal
 */

/**
 * @typedef {Object} SgxsMeta
 * @property {string} sessionId
 * @property {string} deviceIp
 */

/**
 * @typedef ShopifyCart
 * @property {string} id
 * @property {string} checkoutUrl
 * @property {{ customer: ShopifyCartCustomer, purchasingCompany?: ShopifyCartPurchasingCompany }} buyerIdentity
 * @property {ShopifyCartCost} cost
 * @property {{ edges: { node: ShopifyCartLine }[] }} lines
 * @property {{ discountedAmount: { amount: number } }[]} discountAllocations
 * @property {{ applicable: boolean, code: string }[]} discountCodes
 * @property {{ lastCharacters: string, presentmentAmountUsed: ShopifyCartAmount }[]} appliedGiftCards
 * @property {{ edges: { node: ShopifyDeliveryGroup }[] }} deliveryGroups
 */

/**
 * @typedef ShopifyCartCustomer
 * @property {string} id
 * @property {string?} firstName
 * @property {string?} lastName
 * @property {string} email
 * @property {string} createdAt
 */

/**
 * @typedef ShopifyCartPurchasingCompany
 * @property {{ id: string }} location
 */

/**
 * @typedef ShopifyCartCost
 * @property {ShopifyCartAmount} totalAmount
 * @property {ShopifyCartAmount} subtotalAmount
 * @property {ShopifyCartAmount} totalTaxAmount
 */

/**
 * @typedef ShopifyCartAmount
 * @property {number} amount
 * @property {string?} currencyCode
 */

/**
 * @typedef ShopifyCartLine
 * @property {string?} id
 * @property {number} quantity
 * @property {ShopifyCartLineCost?} cost
 * @property {{ discountedAmount: { amount: number } }[]?} discountAllocations
 * @property {ShopifyCartLineProductVariant?} merchandise
 * @property {ShopifyCartLineSellingPlanAllocation?} sellingPlanAllocation
 */

/**
 * @typedef ShopifyCartLineCost
 * @property {ShopifyCartAmount} totalAmount
 * @property {ShopifyCartAmount} amountPerQuantity
 * @property {ShopifyCartAmount} compareAtAmountPerQuantity
 */

/**
 * @typedef ShopifyCartLineProductVariant
 * @property {string} id
 * @property {string} sku
 * @property {number} compareAtPrice
 * @property {ShopifyCartLineProduct} product
 * @property {{ url: string }} image
 * @property {{ type: string, label: string, value: string }[]} selectedOptions
 */

/**
 * @typedef ShopifyCartLineProduct
 * @property {string} id
 * @property {string} title
 * @property {string} vendor
 * @property {ShopifyCartLineProductOption[]} options
 */

/**
 * @typedef ShopifyCartLineProductOption
 * @property {string} id
 * @property {string} name
 * @property {{ id: string, name: string }[]} optionValues
 */

/**
 * @typedef ShopifyCartLineSellingPlanAllocation
 * @property {ShopifyCartLineSellingPlan} sellingPlan

 /**
 * @typedef ShopifyCartLineSellingPlan
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef ShopifyDeliveryGroup
 * @property {{ title: string, estimatedCost: ShopifyCartAmount }} selectedDeliveryOption
 */

/**
 * @typedef ShopifyCartItemMutationResponseInternals
 * @property {ShopifyCartItemMutationResponseUserError}[] userErrors
 * @property {ShopifyCartItemMutationResponseWarning}[] warnings
 */

/**
 * @typedef ShopifyCartItemMutationResponseUserError
 * @property {string[]} fields
 * @property {string} message
 */

/**
 * @typedef ShopifyCartItemMutationResponseWarning
 * @property {string} code
 * @property {string} target
 * @property {string} message
 */

/**
 * @typedef ShopgateCart
 * @property {boolean} isOrderable
 * @property {boolean|null} isTaxIncluded
 * @property {string|null} currency
 * @property {{ code: string, message: string, type: string }[]} messages
 * @property {string} text
 * @property {ShopgateCartItem[]} cartItems
 * @property {{ label: string, amount: number, type: string}[]} totals
 * @property {{ orderable: boolean }} flags
 */

/**
 * @typedef ShopgateCartItem
 * @property {string} id
 * @property {string} type
 * @property {number} quantity
 * @property {{ id: string, name: string }} subscription
 * @property {ShopgateCartItemProduct} product
 */

/**
 * @typedef ShopgateCartItemProduct
 * @property {string} id
 * @property {string} name
 * @property {string} featuredImageUrl
 * @property {{ unit: number, default: number, special: number|null }} price
 * @property {{ type: string, label: string, value: any }[]} properties
 * @property {{ label: string, value: any }[]} additionalInfo
 */
