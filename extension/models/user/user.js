class User {
  constructor () {
    this._id = null
    this._mail = null
    this._firstName = null
    this._lastName = null
    this._gender = null
    this._birthday = null
    this._phone = null
    this._customerGroups = []
    this._addresses = []
  }

  /**
   * @return {{
   * id: (null|*),
   * mail: (*|null),
   * firstName: (*|null),
   * lastName: (*|null),
   * gender: (*|null),
   * birthday: (null|*),
   * phone: (*|null),
   * customerGroups: (*|Array),
   * addresses: (Array|*)
   * }}
   */
  toJSON () {
    return {
      id: this._id,
      mail: this._mail,
      firstName: this._firstName,
      lastName: this._lastName,
      gender: this._gender,
      birthday: this._birthday,
      phone: this._phone,
      customerGroups: this._customerGroups,
      addresses: this._addresses
    }
  }

  get id () {
    return this._id
  }

  set id (value) {
    this._id = value
  }

  get mail () {
    return this._mail
  }

  set mail (value) {
    this._mail = value
  }

  get firstName () {
    return this._firstName
  }

  set firstName (value) {
    this._firstName = value
  }

  get lastName () {
    return this._lastName
  }

  set lastName (value) {
    this._lastName = value
  }

  get gender () {
    return this._gender
  }

  set gender (value) {
    this._gender = value
  }

  get birthday () {
    return this._birthday
  }

  set birthday (value) {
    this._birthday = value
  }

  get phone () {
    return this._phone
  }

  set phone (value) {
    this._phone = value
  }

  get customerGroups () {
    return this._customerGroups
  }

  set customerGroups (value) {
    this._customerGroups = value
  }

  get addresses () {
    return this._addresses
  }

  set addresses (value) {
    this._addresses = value
  }
}

module.exports = User
