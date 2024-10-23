import { css } from 'glamor'
import { themeConfig } from '@shopgate/pwa-common/helpers/config'

const { variables, colors } = themeConfig

const productLevelDiscount = css({
  display: 'inline-block',
  color: colors.primary,
  width: 'auto',
  margin: '-.35em',
  padding: '.35em'
}).toString()

const discountDescription = css({
  marginRight: variables.gap.small * 0.5
}).toString()

export default {
  discountDescription,
  productLevelDiscount
}
