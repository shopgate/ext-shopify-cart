import React, { Fragment } from 'react'
import PropTypes from 'prop-types';
import CartTotalLine from '@shopgate/pwa-ui-shared/CartTotalLine';
import connect from './connector';

/**
 * @returns {JSX}
 */
const CartSubTotalGiftCards = ({ giftCards }) => {
  if (giftCards === null) {
    return null
  }

  return (
    <Fragment>
      {giftCards.map(giftCard =>
        <CartTotalLine>
          <CartTotalLine.Label label={`cart.giftCard`} labelParams={{ giftCardCode: giftCard.label }}/>
          <CartTotalLine.Amount amount={giftCard.amount} currency={giftCard.currency} />
        </CartTotalLine>
      )}
    </Fragment>
  );
};

CartSubTotalGiftCards.propTypes = {
  giftCards: PropTypes.array,
};

CartSubTotalGiftCards.defaultProps = {
  giftCards: null,
};

export default connect(CartSubTotalGiftCards);
