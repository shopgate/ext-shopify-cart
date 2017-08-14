const EINVALIDCALL = 'EINVALIDCALL'

class InvalidCallError {
  constructor (message) {
    this._code = EINVALIDCALL

    this._message = 'The pipeline can\'t be called in the given context.'
    if (message !== null && message !== undefined) {
      this._message = message
    }

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

module.exports = InvalidCallError
