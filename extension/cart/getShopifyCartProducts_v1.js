module.exports = async function (context, input) {
  const shopifyCartData = input.shopifyCartData
  const shopifyRequestErr = input.shopifyRequestErr

  if (shopifyRequestErr) return shopifyRequestErr

  let products = []
  shopifyCartData.checkout.line_items.forEach(function (item) {
    let product = {
      productId: item.product_id,
      variantId: item.variant_id
    }
    products.push(product)
  })

  return { products }
}
