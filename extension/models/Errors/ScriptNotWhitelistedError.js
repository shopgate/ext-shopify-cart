const ESCRIPTNOTWHITELISTED = 'ESCRIPTNOTWHITELISTED'

class ScriptNotWhitelistedError extends Error {
  constructor (scriptName) {
    super(scriptName
      ? `The script '${scriptName}.js' is not whitelisted.`
      : `The given script is not whitelisted.`
    )

    this.code = ESCRIPTNOTWHITELISTED
    this.displayMessage = null
  }
}

module.exports = ScriptNotWhitelistedError
