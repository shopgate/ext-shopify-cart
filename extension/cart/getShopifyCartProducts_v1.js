module.exports = function (context, input, cb) {
  const shopifyCartData = {checkout: input.checkout}
  const shopifyRequestErr = input.shopifyRequestErr

  if (shopifyRequestErr) cb(shopifyRequestErr, {})

  // only load "non variant" or parent products to be able to map them to imported products at Shopgate
  let products = []
  shopifyCartData.checkout.line_items.forEach(function (item) {
    let product = {
      productId: item.product_id,
      variantId: item.variant_id
    }
    products.push(product)
  })

  return cb(null, {
    products: products
  })
}
