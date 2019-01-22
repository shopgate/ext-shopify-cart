module.exports = async function (context, input) {
  return { shopifyCartData: { checkout: input.checkout } }
}
