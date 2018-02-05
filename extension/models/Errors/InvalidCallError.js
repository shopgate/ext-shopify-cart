const EINVALIDCALL = 'EINVALIDCALL'

class InvalidCallError extends Error {
  constructor (message) {
    super((message !== null && message !== undefined)
      ? message
      : 'The pipeline can\'t be called in the given context.'
    )

    this.code = EINVALIDCALL
    this.displayMessage = null
  }
}

module.exports = InvalidCallError
