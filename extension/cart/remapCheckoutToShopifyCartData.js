module.exports = async (context, input) => {
  return { shopifyCartData: { checkout: input.checkout } }
}
