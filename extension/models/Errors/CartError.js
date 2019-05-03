const ECART = 'ECART'

class CartError extends Error {
  constructor () {
    super()
    this.code = ECART
    this.errors = []
  }

  /**
   * @param {string} id - id of the missing product
   */
  addProductNotFound (id) {
    this.errors.push({
      code: 'ENOTFOUND',
      message: 'This product is no longer available.',
      entityId: id,
      translated: false
    })
  }
}

module.exports = CartError
