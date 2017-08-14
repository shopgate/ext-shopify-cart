const EACCESS = 'EACCESS'

class UnauthorizedError {
  constructor (displayMessage) {
    this._code = EACCESS
    this._message = 'Permission denied.'

    this._displayMessage = null
    if (displayMessage !== null && displayMessage !== undefined) {
      this._displayMessage = displayMessage
    }
  }

  toJson () {
    return {
      code: this._code,
      message: this._message,
      displayMessage: this._displayMessage
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

module.exports = UnauthorizedError
