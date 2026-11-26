const EINVALIDCALL = 'EINVALIDCALL'

class InvalidCallError extends Error {
  /**
   * @param {string} message
   */
  constructor (message) {
    super(message)

    this.code = EINVALIDCALL
    this.displayMessage = null
  }
}

module.exports = InvalidCallError
