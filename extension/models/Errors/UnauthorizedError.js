const EACCESS = 'EACCESS'

class UnauthorizedError extends Error {
  constructor (displayMessage) {
    super('Permission denied.')
    this.code = EACCESS

    this.displayMessage = null
    if (displayMessage !== null && displayMessage !== undefined) {
      this.displayMessage = displayMessage
    }
  }
}

module.exports = UnauthorizedError
