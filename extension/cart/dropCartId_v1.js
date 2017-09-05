const Tools = require('../lib/tools')

module.exports = function (context, input, cb) {
  Tools.setCurrentCartId(context, null, cb)
}