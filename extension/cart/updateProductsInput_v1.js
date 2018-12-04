/**
 * Map CartItem to cartItem to comply to new schema
 * @param {Object} context context
 * @param {{CartItem: Object[], cartItems: Object[]}} input input
 * @returns {Promise<{cartItems: Object[]}>}
 */
module.exports = async (context, { CartItem, cartItems: inputCartItems }) => ({
  cartItems: inputCartItems || CartItem
})
