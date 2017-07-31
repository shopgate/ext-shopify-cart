const TYPE_SUCCESS = 'success'
const TYPE_ERROR = 'error'
const TYPE_INFO = 'info'

/**
 * @typedef {object} message
 * @property {string} code
 * @property {string} message
 * @property {string} type
 *
 */
class Message {
  constructor () {
    this._TYPE_SUCCESS = TYPE_SUCCESS
    this._TYPE_ERROR = TYPE_ERROR
    this._TYPE_INFO = TYPE_INFO

    this._code = null
    this._message = null
    this._type = null
  }

  toJson () {
    return {
      code: this.code,
      message: this.message,
      type: this.type
    }
  }

  get TYPE_SUCCESS () {
    return this._TYPE_SUCCESS
  }

  get TYPE_ERROR () {
    return this._TYPE_ERROR
  }

  get TYPE_INFO () {
    return this._TYPE_INFO
  }

  get code () {
    return this._code
  }

  set code (value) {
    this._code = value
  }

  get message () {
    return this._message
  }

  set message (value) {
    this._message = value
  }

  get type () {
    return this._type
  }

  set type (value) {
    this._type = value
  }

  /**
   *
   * @param {string} type
   * @param {string} code
   * @param {string} message
   */
  addMessage (type, code, message) {
    this.code = code
    this.message = message
    this.type = type
  }

  /**
   *
   * @param {string} code
   * @param {string} message
   */
  addSuccessMessage (code, message) {
    this.code = code
    this.message = message
    this.type = this._TYPE_SUCCESS
  }

  /**
   *
   * @param {string} code
   * @param {string} message
   */
  addErrorMessage (code, message) {
    this.code = code
    this.message = message
    this.type = this._TYPE_ERROR
  }

  /**
   *
   * @param {string} code
   * @param {string} message
   */
  addInfoMessage (code, message) {
    this.code = code
    this.message = message
    this.type = this._TYPE_INFO
  }
}

module.exports = Message
