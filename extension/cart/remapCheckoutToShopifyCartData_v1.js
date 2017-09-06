module.exports = function (context, input, cb) {
  cb(null, {shopifyCartData: {checkout: input.checkout}})
}
