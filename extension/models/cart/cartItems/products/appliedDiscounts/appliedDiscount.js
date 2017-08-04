const VALUETYPE_PERCENTAGE = 'percentage'
const VALUETYPE_FIXED = 'fixed'

class AppliedDiscount {
  constructor () {
    this._VALUETYPE_PERCENTAGE = VALUETYPE_PERCENTAGE
    this._VALUETYPE_FIXED = VALUETYPE_FIXED
    this._code = null
    this._description = null
    this._label = null
    this._savedPrice = null
  }

  /**
   * @return {{code: {string}, description: {string}, label: {string}, savedPrice: {number}}}
   */
  toJson () {
    return {
      code: this.code,
      description: this.description,
      label: this.label,
      savedPrice: parseFloat(this.savedPrice)
    }
  }

  get VALUETYPE_PERCENTAGE () {
    return this._VALUETYPE_PERCENTAGE
  }

  set VALUETYPE_PERCENTAGE (value) {
    this._VALUETYPE_PERCENTAGE = value
  }

  get VALUETYPE_FIXED () {
    return this._VALUETYPE_FIXED
  }

  set VALUETYPE_FIXED (value) {
    this._VALUETYPE_FIXED = value
  }

  get code () {
    return this._code
  }

  set code (value) {
    this._code = value
  }

  get description () {
    return this._description
  }

  set description (value) {
    this._description = value
  }

  get label () {
    return this._label
  }

  set label (value) {
    this._label = value
  }

  get savedPrice () {
    return this._savedPrice
  }

  set savedPrice (parameters) {
    let {value, type} = parameters
    this._savedPrice = {
      value: value,
      type: type
    }
  }
}

module.exports = AppliedDiscount
