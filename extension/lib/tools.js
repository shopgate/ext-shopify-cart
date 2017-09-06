class Tools {
  /**
   * @property {Object} path.storage.device
   * @param {Object} obj
   * @param {String} path
   * @return {Boolean}
   * @public
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
   * @public
   */
  static isObject (obj) {
    return obj !== undefined && obj !== null && typeof obj === 'object'
  }

  /**
   * Checks if the given object has no properties or if it is undefined, null, false, empty string or 0
   *
   * @param {Object} obj
   * @return {Boolean}
   * @public
   */
  static isEmpty (obj) {
    return (!obj || Object.keys(obj).length <= 0)
  }

  /**
   * @property {string | int} context.meta.userId
   * @param {Object} context
   * @param {function} cb
   * @public
   */
  static getCurrentCartId (context, cb) {
    const userId = context.meta.userId
    if (userId) {
      context.storage.user.get('checkoutToken', (sErr, cartId) => {
        return cb(sErr, cartId)
      })
    } else {
      context.storage.device.get('checkoutToken', (sErr, cartId) => {
        return cb(sErr, cartId)
      })
    }
  }

  /**
   *
   * @param {Object} context
   * @param {String} cartId
   * @param {function} cb
   * @public
   */
  static setCurrentCartId (context, cartId, cb) {
    const userId = context.meta.userId
    if (userId) {
      context.storage.user.set('checkoutToken', cartId, function (sErr) {
        if (sErr) return cb(sErr)
        return cb(null)
      })
    } else {
      context.storage.device.set('checkoutToken', cartId, function (sErr) {
        if (sErr) return cb(sErr)
        return cb(null)
      })
    }
  }
}

module.exports = Tools
