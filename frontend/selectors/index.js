import { createSelector } from 'reselect';

/**
 * @param {{ cart: Object }} state Application state
 * @return {Object}
 */
const getCart = state => state.cart;
const getTotals = createSelector(getCart, cart => cart.totals);
const getCurrency = createSelector(getCart, cart => cart.currency);

/**
 * @param {Object} state The current application state.
 * @returns {{ }}
 */
export const getGiftCards = createSelector(
  [getTotals, getCurrency],
  (totals, currency) => {
    if (!totals) return []
    return totals.filter(total => total.type === 'giftCard').map(total => ({ ...total, currency }))
  }
);
