const ECUSTOMERNOTFOUND = 'ECUSTOMERNOTFOUND'

class CustomerNotFoundError extends Error {
  constructor () {
    super('Customer not found at Shopify.')

    this.code = ECUSTOMERNOTFOUND
  }
}

module.exports = CustomerNotFoundError
