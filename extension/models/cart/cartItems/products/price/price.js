class Price {
  constructor () {
    this._unit = null
    this._default = null
    this._special = null
  }

  /**
   * @return {{unit: {number}, default: {number}, special: {number}}}
   */
  toJson () {
    return {
      unit: parseFloat(this.unit),
      default: parseFloat(this.default),
      special: parseFloat(this.special)
    }
  }

  get unit () {
    return this._unit
  }

  set unit (value) {
    this._unit = value
  }

  get default () {
    return this._default
  }

  set default (value) {
    this._default = value
  }

  get special () {
    return this._special
  }

  set special (value) {
    this._special = value
  }
}

module.exports = Price
