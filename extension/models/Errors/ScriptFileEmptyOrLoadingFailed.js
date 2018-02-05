const SCRIPTFILEEMPTYORLOADINGFAILED = 'SCRIPTFILEEMPTYORLOADINGFAILED'

class ScriptFileEmptyOrLoadingFailed extends Error {
  constructor (scriptName) {
    super(scriptName
      ? `The script file '${scriptName}.js' is empty or failed to load.`
      : `The given script is empty or failed to load.`
    )

    this.code = SCRIPTFILEEMPTYORLOADINGFAILED
    this.displayMessage = null
  }
}

module.exports = ScriptFileEmptyOrLoadingFailed
