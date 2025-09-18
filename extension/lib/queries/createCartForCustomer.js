module.exports = `
mutation cartCreate($buyerIdentity: CartBuyerIdentityInput) {
  cartCreate(input: { buyerIdentity: $buyerIdentity }) {
    cart {
      id
    }
    userErrors {
      code
      field
      message
    }
    warnings {
      code
      message
      target
    }
  }
}
`
