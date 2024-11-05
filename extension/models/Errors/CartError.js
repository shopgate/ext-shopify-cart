const ECART = 'ECART'

class CartError extends Error {
  constructor () {
    super()
    this.code = ECART
    this.errors = []
  }
}

module.exports = CartError
