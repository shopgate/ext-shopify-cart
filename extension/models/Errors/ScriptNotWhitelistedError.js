const ESCRIPTNOTWHITELISTED = 'ESCRIPTNOTWHITELISTED'

class ScriptNotWhitelistedError extends Error {
  constructor (scriptName) {
    super(scriptName
      ? `The script '${scriptName}.js' is not whitelisted.`
      : `The given script is not whitelisted.`
    )

    this._code = ESCRIPTNOTWHITELISTED
    this._displayMessage = null
  }

  get code () {
    return this._code
  }

  get message () {
    return this._message
  }
  get displayMessage () {
    return this._displayMessage
  }
}

module.exports = ScriptNotWhitelistedError
