const TYPE_INFO = 'info'
const TYPE_LEGAL = 'legal'

class Text {
  constructor () {
    this._TYPE_INFO = TYPE_INFO
    this._TYPE_LEGAL = TYPE_LEGAL
    this._legalText = null
    this._infoText = null
  }

  /**
   * @return {{legalText: {string}, legalInfo: {string}}}
   */
  toJson () {
    return {
      legalText: this.legalText,
      legalInfo: this.infoText
    }
  }

  get TYPE_INFO () {
    return this._TYPE_INFO
  }

  get TYPE_LEGAL () {
    return this._TYPE_LEGAL
  }

  get legalText () {
    return this._legalText
  }

  set legalText (value) {
    this._legalText = value
  }

  get infoText () {
    return this._infoText
  }

  set infoText (value) {
    this._infoText = value
  }
}

module.exports = Text
