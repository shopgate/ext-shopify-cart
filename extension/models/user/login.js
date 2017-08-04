const _ = require('underscore')
const possibleStrategies = ['basic', 'facebook', 'twitter']

class Login {
  /**
   * @param strategy
   */
  constructor (strategy = 'basic') {
    this._strategy = strategy
    this._parameters = {}
    this._login = null
    this._password = null
  }

  /**
   * @return {{strategy: {string}, parameters: {Array}, login: {string}, password: {string}}}
   */
  toJson () {
    return {
      strategy: this.strategy,
      parameters: this.parameters,
      login: this.login,
      password: this.password
    }
  }

  static isValidStrategy (strategy) {
    return _.contains(possibleStrategies, strategy)
  }

  get strategy () {
    return this._strategy
  }

  set strategy (value) {
    this._strategy = value
  }

  get parameters () {
    return this._parameters
  }

  set parameters (value) {
    this._parameters = value
  }

  get login () {
    return this._login
  }

  set login (value) {
    this._login = value
  }

  get password () {
    return this._password
  }

  set password (value) {
    this._password = value
  }
}

module.exports = Login
