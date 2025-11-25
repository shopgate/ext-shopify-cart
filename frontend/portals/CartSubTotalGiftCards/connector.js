import { connect } from 'react-redux';
import { getGiftCards } from '../../selectors';

/**
 * @param {Object} state state
 * @returns {Object}
 */
const mapStateToProps = state => ({
  giftCards: getGiftCards(state),
});

export default connect(mapStateToProps);
