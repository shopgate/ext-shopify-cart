const TYPE_PRODUCT = 'product'
const TYPE_COUPON = 'coupon'

class CartItem {
  constructor () {
    this._TYPE_PRODUCT = TYPE_PRODUCT
    this._TYPE_COUPON = TYPE_COUPON

    this._id = null
    this._quantity = null
    this._type = null
    this._product = null
    this._coupon = null
    this._messages = []
  }

  /**
   * @return {{id: {number}, quantity: {number}, type: {string}, product: {product}, coupon: {coupon}}}
   */
  toJson () {
    return {
      id: this.id,
      quantity: parseInt(this.quantity),
      type: this.type,
      product: this.product,
      coupon: this.coupon,
      messages: this._messages
    }
  }

  get TYPE_PRODUCT () {
    return this._TYPE_PRODUCT
  }

  get TYPE_COUPON () {
    return this._TYPE_COUPON
  }

  get id () {
    return this._id
  }

  set id (value) {
    this._id = value
  }

  get quantity () {
    return this._quantity
  }

  set quantity (value) {
    this._quantity = value
  }

  get type () {
    return this._type
  }

  set type (value) {
    this._type = value
  }

  get product () {
    return this._product
  }

  set product (value) {
    this._product = value
  }

  get coupon () {
    return this._coupon
  }

  set coupon (value) {
    this._coupon = value
  }

  get messages () {
    return this._messages
  }

  set messages (value) {
    this._messages = value
  }
}

module.exports = CartItem
