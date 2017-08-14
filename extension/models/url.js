class Url {
  constructor (url, expires) {
    this._url = url

    this._expires = null
    if (expires !== null && expires !== undefined && expires !== '') {
      this._expires = expires
    }
  }

  toJson () {
    return {
      url: this._url,
      expires: this._expires
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
