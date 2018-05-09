class Address {
  constructor () {
    this._id = null
    this._type = null
    this._firstName = null
    this._lastName = null
    this._company = null
    this._street1 = null
    this._street2 = null
    this._city = null
    this._state = null
    this._phone = null
    this._isDefault = true
    this._alias = null
    this._zipcode = null
    this._country = null
  }

  /**
   * @return {{
   * id: (*|null),
   * type: (*|null),
   * firstName: (null|*),
   * lastName: (null|*),
   * company: (null|*),
   * street1: (null|*),
   * street2: (*|null),
   * city: (*|null),
   * state: (*|null),
   * phone: (*|null),
   * isDefault: (*|boolean),
   * alias: (*|null)
   * }}
   */
  toJSON () {
    return {
      id: this._id,
      type: this._type,
      firstName: this._firstName,
      lastName: this._lastName,
      company: this._company,
      street1: this._street1,
      street2: this._street2,
      city: this._city,
      state: this._state,
      phone: this._phone,
      isDefault: this._isDefault,
      alias: this._alias,
      zipcode: this._zipcode,
      country: this._country
    }
  }

  get values () {
    return this
  }

  get id () {
    return this._id
  }

  set id (value) {
    this._id = value
  }

  get type () {
    return this._type
  }

  set type (value) {
    this._type = value
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

  get company () {
    return this._company
  }

  set company (value) {
    this._company = value
  }

  get street1 () {
    return this._street1
  }

  set street1 (value) {
    this._street1 = value
  }

  get street2 () {
    return this._street2
  }

  set street2 (value) {
    this._street2 = value
  }

  get city () {
    return this._city
  }

  set city (value) {
    this._city = value
  }

  get state () {
    return this._state
  }

  set state (value) {
    this._state = value
  }

  get phone () {
    return this._phone
  }

  set phone (value) {
    this._phone = value
  }

  get isDefault () {
    return this._isDefault
  }

  set isDefault (value) {
    this._isDefault = value
  }

  get alias () {
    return this._alias
  }

  set alias (value) {
    this._alias = value
  }

  get zipcode () {
    return this._zipcode
  }

  set zipcode (value) {
    this._zipcode = value
  }

  get country () {
    return this._country
  }

  set country (value) {
    this._country = value
  }
}

module.exports = Address
