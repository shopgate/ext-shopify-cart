module.exports = `
mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
        cart {
            attributes {
                key
                value
            }
        }
        userErrors {
            field
            message
            code
        }
        warnings {
          code
          message
          target
        }
    }
}
`
