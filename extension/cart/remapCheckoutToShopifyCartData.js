// todo kept for reference, delete when CURB-3804 is done
module.exports = async (context, input) => {
  return { shopifyCartData: { checkout: input.checkout } }
}
