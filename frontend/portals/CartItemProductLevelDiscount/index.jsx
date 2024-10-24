import React from 'react'

import I18n from '@shopgate/pwa-common/components/I18n'

import styles from './style'

const CartItemProductLevelDiscount = lineItem => {
  if (!lineItem.currency || !lineItem.product.price.discount) return null

  return (
    <div className={styles.productLevelDiscount}>
      <I18n.Text string="cart.productDiscount" className={styles.discountDescription} />
      <I18n.Price
        currency={lineItem.currency}
        price={-lineItem.product.price.discount}
      />
    </div>
  )
}

export default CartItemProductLevelDiscount
