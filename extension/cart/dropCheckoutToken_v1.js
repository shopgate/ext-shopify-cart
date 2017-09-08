/**
 * @param {Object} context
 * @param {Object} input
 * @param {function} cb
 */
module.exports = function (context, input, cb) {
  // select storage to use: device or user, if logged in
  let storage = context.storage.device
  if (context.meta.userId) {
    storage = context.storage.user
  }

  // setting to null equals to "dropping" it
  storage.set('checkoutToken', null, function (err) {
    return cb(err || null)
  })
}
