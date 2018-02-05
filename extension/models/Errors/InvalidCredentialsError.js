const EINVALIDCREDENTIALS = 'EINVALIDCREDENTIALS'

class InvalidCredentialsError extends Error {
  constructor (displayMessage, message) {
    super((message !== null && message !== undefined)
      ? message
      : 'The given credentials are wrong or do not exist.'
    )

    this.code = EINVALIDCREDENTIALS
    this.displayMessage = null
    if (displayMessage !== null) {
      this.displayMessage = displayMessage
    }
  }
}

module.exports = InvalidCredentialsError
