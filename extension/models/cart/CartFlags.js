class CartFlags {
  constructor (taxIncluded, orderable, coupons) {
    this._orderable = orderable
    this._taxIncluded = taxIncluded
    this._coupons = coupons
  }

  get orderable () {
    return this._orderable
  }

  set orderable (value) {
    this._orderable = value
  }

  get taxIncluded () {
    return this._taxIncluded
  }

  set taxIncluded (value) {
    this._taxIncluded = value
  }

  get coupons () {
    return this._coupons
  }

  set coupons (value) {
    this._coupons = value
  }
}

module.exports = CartFlags
