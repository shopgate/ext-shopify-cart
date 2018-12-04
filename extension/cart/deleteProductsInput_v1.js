/**
 * Map CartItem to cartItem to comply to new schema
 * @param {Object} context context
 * @param {{CartItemIds: Object[], cartItemIds: Object[]}}input input
 * @returns {Promise<{cartItemIds: Object[]}>}
 */
module.exports = async (context, { CartItemIds, cartItemIds: inputCartItemIds }) => ({
  cartItemIds: inputCartItemIds || CartItemIds
})
