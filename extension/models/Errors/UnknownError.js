const EUNKNOWN = 'EUNKNOWN'

class UnknownError {
  constructor () {
    this._code = EUNKNOWN
    this._message = 'An internal error occured.'
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
