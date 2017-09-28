class CartFlags {
  constructor (taxIncluded, orderable, coupons) {
    this._taxIncluded = taxIncluded
    this._orderable = orderable
    this._coupons = coupons
  }

  get taxIncluded () {
    return this._taxIncluded
  }

  set taxIncluded (value) {
    this._taxIncluded = value
  }

  get orderable () {
    return this._orderable
  }

  set orderable (value) {
    this._orderable = value
  }

  get coupons () {
    return this._coupons
  }

  set coupons (value) {
    this._coupons = value
  }
}

module.exports = CartFlags
