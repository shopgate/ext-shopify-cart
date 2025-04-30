module.exports = `
query getCart($cartId: ID!) {
  cart(id: $cartId) {
    id
    checkoutUrl
    createdAt
    updatedAt
    attributes {
      key
      value
    }
    cost {
      subtotalAmount {
        amount
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
      }
    }
    buyerIdentity {
      customer {
        id
        firstName
        lastName
        email
        createdAt
      }
      purchasingCompany {
        location {
          id
        }
      }
    }

    lines(first: 250) {
      edges {
        node {
          id
          quantity
          cost {
            amountPerQuantity {
              amount
            }
            compareAtAmountPerQuantity {
              amount
            }
            totalAmount {
              amount
            }
          }
          discountAllocations {
            discountedAmount { amount }
          }
          merchandise {
            ... on ProductVariant {
              id
              sku
              title
              image { url }
              compareAtPrice { amount }
              selectedOptions {
                name
                value
              }
              product {
                id
                title
                vendor
                options { id name optionValues { id name } }
              }
            }
          }
        }
      }
    }
    discountAllocations {
      discountedAmount { amount }
    }
    discountCodes {
      applicable
      code
    }
    appliedGiftCards {
      lastCharacters
      presentmentAmountUsed {
        amount
      }
    }
    deliveryGroups(first:250) {
      edges {
        node {
          selectedDeliveryOption {
            title
            estimatedCost {
              amount
            }
          }
        }
      }
    }
  }
}
`
