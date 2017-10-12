class CartFlags {
  constructor (orderable, taxIncluded, coupons) {
    this.orderable = orderable
    this.taxIncluded = taxIncluded
    this.coupons = coupons
  }
}

module.exports = CartFlags
