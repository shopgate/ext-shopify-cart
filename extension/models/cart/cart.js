const CartFlags = require('./CartFlags')

class Cart {
  constructor () {
    let orderable = false
    let taxIncluded = false
    let coupons = false

    this.id = null
    this.currency = null
    this.isOrderable = orderable
    this.isTaxIncluded = taxIncluded
    this.messages = []
    this.text = null
    this.cartItems = []
    this.totals = []
    this.flags = new CartFlags(orderable, taxIncluded, coupons)
  }

  /**
   *
   * @param {Message} message
   */
  addMessage (message) {
    this.messages.push(message)
  }

  /**
   * @param {CartItem} cartItem
   */
  addCartItem (cartItem) {
    this.cartItems.push(cartItem.toJson())
  }

  /**
   * @param {object} total
   */
  addTotal (total) {
    this.totals.push(total)
  }
}

module.exports = Cart
