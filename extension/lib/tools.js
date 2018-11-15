class Tools {
  /**
   * @property {Object} path.storage.device
   * @param {Object} obj
   * @param {String} path
   * @return {Boolean}
   */
  static propertyExists (obj, path) {
    if (!obj) return false
    if (obj && !path) return true

    const props = path.split('.')
    let currentObject = obj

    for (let i = 0; i < props.length; ++i) {
      currentObject = currentObject[props[i]]
      if (!currentObject) return false
    }

    return true
  }

  /**
   * Checks if the given parameter is an object
   *
   * @param {Object} obj
   * @return {Boolean}
   */
  static isObject (obj) {
    return obj !== undefined && obj !== null && typeof obj === 'object'
  }

  /**
   * Checks if the given object has no properties or if it is undefined, null, false, empty string or 0
   *
   * @param {Object} obj
   * @return {Boolean}
   */
  static isEmpty (obj) {
    return (!obj || Object.keys(obj).length <= 0)
  }

  /**
   * @param {SDKContext} context
   * @param {function} cb
   */
  static getCurrentCartId (context, cb) {
    const storage = context.meta.userId ? context.storage.user : context.storage.device

    storage.get('checkoutToken', (sErr, cartId) => {
      return cb(sErr, cartId)
    })
  }

  /**
   *
   * @param {SDKContext} context
   * @param {string} cartId
   * @param {function} cb
   */
  static setCurrentCartId (context, cartId, cb) {
    const storage = context.meta.userId ? context.storage.user : context.storage.device

    storage.set('checkoutToken', cartId, function (sErr) {
      return cb(sErr, null)
    })
  }
}

module.exports = Tools
