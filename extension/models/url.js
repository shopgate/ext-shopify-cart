class Url {
  constructor (url, expires) {
    this.url = ''
    if (url !== null && url !== undefined) {
      this.url = url
    }

    if (expires !== null && expires !== undefined && expires !== '') {
      this.expires = expires
    }
  }
}

module.exports = Url
