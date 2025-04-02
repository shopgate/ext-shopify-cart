module.exports = `
mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    userErrors {
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
