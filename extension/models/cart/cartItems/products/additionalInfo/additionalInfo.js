class AdditionalInfo {
  constructor () {
    this._label = null
    this._value = null
  }

  /**
   * @return {{label: {string}, value: {string}}}
   */
  toJson () {
    return {
      label: this.label,
      value: this.value
    }
  }

  get label () {
    return this._label
  }

  set label (value) {
    this._label = value
  }

  get value () {
    return this._value
  }

  set value (value) {
    this._value = value
  }
}

module.exports = AdditionalInfo
