class Tools {
  /**
   * @param {SDKContext} context
   * @returns {string}
   */
  static async getCurrentCartId (context) {
    const storage = context.meta.userId ? context.storage.user : context.storage.device
    const currentCartId = await storage.get('checkoutToken')
    return currentCartId
  }

  /**
   *
   * @param {SDKContext} context
   * @param {string} cartId
   * @returns {string}
   */
  static async setCurrentCartId (context, cartId) {
    const storage = context.meta.userId ? context.storage.user : context.storage.device
    const currentCartId = await storage.set('checkoutToken', cartId)
    return currentCartId
  }
}

module.exports = Tools
