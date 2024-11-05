import { createSelector } from 'reselect'

const getCart = state => state.cart
const getTotals = createSelector(getCart, cart => cart.totals)
const getCurrency = createSelector(getCart, cart => cart.currency)

/**
 * @param {Object} state The current application state.
 * @returns {{ }}
 */
export const getGiftCards = createSelector(
  [getTotals, getCurrency],
  (totals, currency) => totals.filter(total => total.type === 'giftCard').map(total => ({ ...total, currency }))
)
