class Tools {
  /**
   * @param {SDKContext} context
   * @returns {Promise}
   */
  static getCurrentCartId (context) {
    const storage = context.meta.userId ? context.storage.user : context.storage.device

    return new Promise((resolve, reject) => {
      storage.get('checkoutToken', (sErr, cartId) => {
        if (sErr) reject(sErr)
        resolve(cartId)
      })
    })
  }

  /**
   *
   * @param {SDKContext} context
   * @param {string} cartId
   * @returns {Promise}
   */
  static setCurrentCartId (context, cartId) {
    const storage = context.meta.userId ? context.storage.user : context.storage.device
    return new Promise((resolve, reject) => {
      storage.set('checkoutToken', cartId, (sErr) => {
        if (sErr) reject(sErr)
        resolve(cartId)
      })
    })
  }
}

module.exports = Tools
