class Url {
  constructor (url, expires) {
    this._url = url

    if (expires !== null && expires !== undefined && expires !== '') {
      this._expires = expires
    }
  }

  /**
   * @return {string}
   */
  get url () {
    return this._url
  }

  /**
   * @return {string}
   */
  get expires () {
    return this._expires
  }
}

module.exports = Url
