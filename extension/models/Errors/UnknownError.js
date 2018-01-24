const EUNKNOWN = 'EUNKNOWN'

class UnknownError extends Error {
  constructor () {
    super('An internal error occured.')

    this.code = EUNKNOWN
    this.displayMessage = null
  }
}

module.exports = UnknownError
