const EINVALIDCREDENTIALS = 'EINVALIDCREDENTIALS'

class InvalidCredentialsError extends Error {
  constructor (displayMessage, message) {
    super((message !== null && message !== undefined)
      ? message
      : 'The given credentials are wrong or do not exist.'
    )

    this._code = EINVALIDCREDENTIALS
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
