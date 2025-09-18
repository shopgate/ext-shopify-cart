module.exports = `
mutation cartCreate {
  cartCreate {
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
