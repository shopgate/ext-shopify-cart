module.exports = `
mutation cartCreate($buyerIdentity: CartBuyerIdentityInput) {
  cartCreate(input: { buyerIdentity: $buyerIdentity }) {
    cart {
      id
    }
  }
}
`
