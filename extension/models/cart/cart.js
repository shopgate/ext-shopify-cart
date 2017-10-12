const CartFlags = require('./CartFlags')

class Cart {
  constructor () {
    let orderable = false
    let taxIncluded = false
    let coupons = false

    this._id = null
    this._currency = null
    this._isOrderable = orderable
    this._isTaxIncluded = taxIncluded
    this._messages = []
    this._text = null
    this._cartItems = []
    this._totals = []
    this._flags = new CartFlags(orderable, taxIncluded, coupons)
  }

  get id () {
    return this._id
  }

  set id (value) {
    this._id = value
  }

  get currency () {
    return this._currency
  }

  set currency (value) {
    this._currency = value
  }

  get isOrderable () {
    return this._isOrderable
  }

  set isOrderable (value) {
    this._isOrderable = value
  }

  get isTaxIncluded () {
    return this._isTaxIncluded
  }

  set isTaxIncluded (value) {
    this._isTaxIncluded = value
  }

  get messages () {
    return this._messages
  }

  /**
   *
   * @param {Message} message
   */
  addMessage (message) {
    this._messages.push(message)
  }

  get text () {
    return this._text
  }

  set text (value) {
    this._text = value
  }

  get cartItems () {
    return this._cartItems
  }

  /**
   * @param {CartItem} cartItem
   */
  addCartItem (cartItem) {
    this._cartItems.push(cartItem.toJson())
  }

  get totals () {
    return this._totals
  }

  /**
   * @param {object} total
   */
  addTotal (total) {
    this._totals.push(total)
  }

  /**
   * @return {CartFlags}
   */
  get flags () {
    return this._flags
  }

  /**
   * @param {CartFlags} value
   */
  set flags (value) {
    this._flags = value
  }
}

module.exports = Cart
