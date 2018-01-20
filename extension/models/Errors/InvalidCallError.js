const EINVALIDCALL = 'EINVALIDCALL'

class InvalidCallError extends Error {
  constructor (message) {
    super((message !== null && message !== undefined)
      ? message
      : 'The pipeline can\'t be called in the given context.'
    )

    this._code = EINVALIDCALL
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
