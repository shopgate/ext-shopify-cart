class Url {
  constructor (url) {
    this._url = url
  }

  toJson () {
    return {
      url: this._url
    }
  }

  /**
   * @return {string}
   */
  get url () {
    return this._url
  }
}

module.exports = Url
