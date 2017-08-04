const TYPE_OPTION = 'option'
const TYPE_INPUT = 'input'

class Property {
  constructor () {
    this._TYPE_OPTION = TYPE_OPTION
    this._TYPE_INPUT = TYPE_INPUT

    this._type = null
    this._label = null
    this._value = null
  }

  /**
   * @return {{type: {string}, label: {string}, value: {string}}}
   */
  toJson () {
    return {
      type: this.type,
      label: this.label,
      value: this.value
    }
  }

  get TYPE_OPTION () {
    return this._TYPE_OPTION
  }

  get TYPE_INPUT () {
    return this._TYPE_INPUT
  }

  get type () {
    return this._type
  }

  set type (value) {
    this._type = value
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

module.exports = Property
