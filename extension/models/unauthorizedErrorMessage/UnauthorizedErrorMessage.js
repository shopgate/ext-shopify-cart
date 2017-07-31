const EACCESS = 'EACCESS'

class UnauthorizedErrorMessage {
  constructor (message) {
    this._code = EACCESS
    this._message = message
  }

  toJson () {
    return {
      code: this.code,
      message: this.message
    }
  }

  get code () {
    return this._code
  }

  get message () {
    return this._message
  }
}

module.exports = UnauthorizedErrorMessage
