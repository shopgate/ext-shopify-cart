const path = require('path')
const fs = require('fs')
const ScriptNotWhitelistedError = require('../models/Errors/ScriptNotWhitelistedError')
const ScriptFileEmptyOrLoadingFailed = require('../models/Errors/ScriptFileEmptyOrLoadingFailed')

/**
 * @param {object} context
 * @param {object} input - Properties depend on the pipeline this is used for
 *
 * @param {Object} [input.scriptName]
 *
 * @param {Function} cb
 */
module.exports = function (context, input, cb) {
  // secure the script loader by prohibiting access to any files that are not whitelisted and removing path characters
  const scriptName = input.scriptName.replace(/[\s\uFEFF\xA0./\\]+/g, '')
  const whitelist = {
    '__init': true,
    'login_register': true,
    'account': true,
    'challenge': true,
    'checkouts': true
  }
  if (!whitelist[scriptName]) {
    return cb(new ScriptNotWhitelistedError(scriptName))
  }

  const filename = path.resolve(__dirname, 'scripts', scriptName + '.js')
  fs.readFile(filename, 'utf8', (err, scriptCode) => {
    // log original error
    if (err) {
      context.log.error(`Error loading script file '${scriptName}.js'. Thrown error: ` + JSON.stringify(err))
    }

    if (err || !scriptCode) {
      return cb(new ScriptFileEmptyOrLoadingFailed(scriptName))
    }

    cb(null, {scriptName: scriptName, scriptCode: Buffer.from(scriptCode).toString('base64')})
  })
}
