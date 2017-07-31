class Product {
  constructor () {
    this._id = null
    this._name = null
    this._featuredImageUrl = null
    this._price = null
    this._properties = []
    this._appliedDiscounts = []
    this._additionalInfo = []
  }

  /**
   * @return {{
   * id: {number},
   * name: {string},
   * featuredImageUrl: {string},
   * price: {number},
   * externalId: {string},
   * properties: {Array},
   * appliedDiscounts: {appliedDiscounts},
   * additionalInfo: {additionalInfo}
   * }}
   */
  toJson () {
    return {
      id: this.id,
      name: this.name,
      featuredImageUrl: this.featuredImageUrl,
      price: this.price,
      properties: this.properties,
      appliedDiscounts: this.appliedDiscounts,
      additionalInfo: this.additionalInfo
    }
  }

  get id () {
    return this._id
  }

  set id (value) {
    this._id = value
  }

  get name () {
    return this._name
  }

  set name (value) {
    this._name = value
  }

  get featuredImageUrl () {
    return this._featuredImageUrl
  }

  set featuredImageUrl (value) {
    this._featuredImageUrl = value
  }

  get price () {
    return this._price
  }

  set price (value) {
    this._price = value
  }

  get externalId () {
    return this._externalId
  }

  set externalId (value) {
    this._externalId = value
  }

  get properties () {
    return this._properties
  }

  get appliedDiscounts () {
    return this._appliedDiscounts
  }

  get additionalInfo () {
    return this._additionalInfo
  }
  /**
   *
   * @param {Property} property
   */
  addProperty (property) {
    this._properties.push(property.toJson())
  }

  /**
   * @param {AppliedDiscount} appliedDiscount
   */
  addAppliedDiscount (appliedDiscount) {
    this._appliedDiscounts.push(appliedDiscount.toJson())
  }

  /**
   *
   * @param {AdditionalInfo} additionalInfo
   */
  addAdditionalInfo (additionalInfo) {
    this._additionalInfo.push(additionalInfo.toJson())
  }
}

module.exports = Product
