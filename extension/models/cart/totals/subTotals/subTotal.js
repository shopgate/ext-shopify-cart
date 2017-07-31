const TYPE_SUBTOTAL = 'subTotal'
const TYPE_DISCOUNT = 'discount'
const TYPE_SHIPPING = 'shipping'
const TYPE_TAX = 'tax'
const TYPE_PAYMENT = 'payment'
const TYPE_GRANDTOTAL = 'grandTotal'
const TYPE_CUSTOM = 'custom'

class SubTotal {
  constructor () {
    this._TYPE_SUBTOTAL = TYPE_SUBTOTAL
    this._TYPE_DISCOUNT = TYPE_DISCOUNT
    this._TYPE_SHIPPING = TYPE_SHIPPING
    this._TYPE_TAX = TYPE_TAX
    this._TYPE_PAYMENT = TYPE_PAYMENT
    this._TYPE_GRANDTOTAL = TYPE_GRANDTOTAL
    this._TYPE_CUSTOM = TYPE_CUSTOM

    this._total = null
    this._totalShipping = null
    this._totalPayment = null
    this._totalDiscount = null
    this._totalGrant = null
    this._totalCustom = null
    this._label = null
    this._amount = null
    this._type = null
  }

  /**
   *
   * @returns {{label: *, amount: Number, type: *}}
   */
  toJson () {
    return {
      label: this.label,
      amount: parseFloat(this.amount),
      type: this.type
    }
  }

  get TYPE_SUBTOTAL () {
    return this._TYPE_SUBTOTAL
  }

  get TYPE_DISCOUNT () {
    return this._TYPE_DISCOUNT
  }

  get TYPE_SHIPPING () {
    return this._TYPE_SHIPPING
  }

  get TYPE_TAX () {
    return this._TYPE_TAX
  }

  get TYPE_PAYMENT () {
    return this._TYPE_PAYMENT
  }

  get TYPE_GRANDTOTAL () {
    return this._TYPE_GRANDTOTAL
  }

  get TYPE_CUSTOM () {
    return this._TYPE_CUSTOM
  }

  get total () {
    return this._total
  }

  set total (value) {
    this._total = value
  }

  get totalShipping () {
    return this._totalShipping
  }

  set totalShipping (value) {
    this._totalShipping = value
  }

  get totalPayment () {
    return this._totalPayment
  }

  set totalPayment (value) {
    this._totalPayment = value
  }

  get totalDiscount () {
    return this._totalDiscount
  }

  set totalDiscount (value) {
    this._totalDiscount = value
  }

  get totalGrant () {
    return this._totalGrant
  }

  set totalGrant (value) {
    this._totalGrant = value
  }

  get totalCustom () {
    return this._totalCustom
  }

  set totalCustom (value) {
    this._totalCustom = value
  }

  get label () {
    return this._label
  }

  set label (value) {
    this._label = value
  }

  get amount () {
    return this._amount
  }

  set amount (value) {
    this._amount = value
  }

  get type () {
    return this._type
  }

  set type (value) {
    this._type = value
  }
}

module.exports = SubTotal
