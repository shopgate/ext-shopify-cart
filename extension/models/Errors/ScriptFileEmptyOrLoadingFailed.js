const SCRIPTFILEEMPTYORLOADINGFAILED = 'SCRIPTFILEEMPTYORLOADINGFAILED'

class ScriptFileEmptyOrLoadingFailed extends Error {
  constructor (scriptName) {
    super(scriptName
      ? `The script file '${scriptName}.js' is empty or failed to load.`
      : `The given script is empty or failed to load.`
    )

    this._code = SCRIPTFILEEMPTYORLOADINGFAILED
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

module.exports = ScriptFileEmptyOrLoadingFailed
