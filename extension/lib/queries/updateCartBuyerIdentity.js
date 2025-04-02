module.exports = `
mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
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
