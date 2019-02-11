/**
 * @param {Object} context
 */
module.exports = async function (context) {
  // select storage to use: device or user, if logged in
  const storage = context.meta.userId ? context.storage.user : context.storage.device

  return storage.set('checkoutToken', null)
}
