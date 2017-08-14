const EINVALIDCREDENTIALS = 'EINVALIDCREDENTIALS'

class InvalidCredentialsError {
  constructor (displayMessage, message) {
    this._code = EINVALIDCREDENTIALS

    this._message = 'The given credentials are wrong or do not exist.'
    if (message !== null && message !== undefined) {
      this._message = message
    }

    this._displayMessage = null
    if (displayMessage !== null) {
      this._displayMessage = displayMessage
    }
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

module.exports = InvalidCredentialsError
