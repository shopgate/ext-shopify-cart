/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async function (context, input) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  const token = await storage.set('checkoutToken', null)
  return token
}
