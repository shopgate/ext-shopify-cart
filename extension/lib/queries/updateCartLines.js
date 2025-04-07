module.exports = `
mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
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
