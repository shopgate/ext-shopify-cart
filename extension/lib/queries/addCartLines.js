module.exports = `
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
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
