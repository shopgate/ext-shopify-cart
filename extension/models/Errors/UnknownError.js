const EUNKNOWN = 'EUNKNOWN'

class UnknownError extends Error {
  constructor () {
    super('An internal error occured.')

    this._code = EUNKNOWN
    this._displayMessage = null
  }

  toJson () {
    return {
      code: this._code,
      message: this._message
    }
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

module.exports = UnknownError
