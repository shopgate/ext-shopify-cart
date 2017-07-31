const SubTotal = require('./subTotals/subTotal')

class Total extends SubTotal {
  constructor () {
    super()
    this.subTotals = []
  }

  /**
   *
   * @param {object} subTotal
   */
  addSubtotal (subTotal) {
    this.subTotals.push(subTotal)
  }
}

module.exports = Total
