# Shopgate Connect - Shopify Cart Extension

[![GitHub license](http://dmlc.github.io/img/apache2.svg)](LICENSE)
[![Build Status](https://travis-ci.org/shopgate/ext-shopify-cart.svg?branch=master)](https://travis-ci.org/shopgate/ext-shopify-cart)
[![Coverage Status](https://coveralls.io/repos/github/shopgate/ext-shopify-cart/badge.svg?branch=master)](https://coveralls.io/github/shopgate/ext-shopify-cart?branch=master)

This Shopify extension will handle the synchronisation of cart data between Shopgate to Shopify.

## Pipelines

The cart pipelines (`shopgate.cart.*`) are documented in [docs/cart.yaml](docs/cart.yaml). In addition, the extension
provides the following pipelines.

### shopgate.shopify-cart.updateCartAttributes.v1

Adds, changes or removes attributes of the Shopify cart (`cart.attributes`). Shopify passes cart attributes on to the
checkout and the order, so shops use them to pass information to the checkout, like a web shop does via
`/cart/update.js`. For example, a checkout can preselect "business" or "private" customer from a `customer_type`
attribute.

The given attributes are merged into the attributes of the cart:

- keys that are not given keep their values
- a `null` value removes a key
- if a key is given more than once, the last one wins
- keys must be non-empty strings and values must be strings or `null`; otherwise the pipeline fails with `EINVALIDCALL`
- if Shopify rejects the attributes (e.g. a value is too long), the pipeline fails with `ECART`

The output contains all attributes of the cart after the update.

Request:

```json
{
  "attributes": [
    { "key": "customer_type", "value": "b2c" },
    { "key": "obsolete_key", "value": null }
  ]
}
```

Response, if the cart had the attributes `source` and `obsolete_key` before:

```json
{
  "attributes": [
    { "key": "source", "value": "app" },
    { "key": "customer_type", "value": "b2c" }
  ]
}
```

Calling the pipeline from a frontend extension:

```js
import { PipelineRequest } from '@shopgate/engage/core';

const { attributes } = await new PipelineRequest('shopgate.shopify-cart.updateCartAttributes.v1')
  .setInput({ attributes: [{ key: 'customer_type', value: 'b2c' }] })
  .dispatch();
```

Things to keep in mind:

- the cart attributes are also returned by `shopgate.cart.getCart.v1` (`attributes`) and
  `shopgate.shopify-cart.getShopifyCart.v1` (`shopifyCart.attributes`)
- on log-in, the attributes of the guest cart are added to the customer cart and removed from the guest cart; if both
  carts have the same key, the value of the customer cart is kept
- after a checkout Shopify creates a new, empty cart without attributes, so set attributes that the checkout depends
  on right before opening the checkout, not only when they change
- the attributes are read, merged and written back, so concurrent calls for the same cart may overwrite each other;
  don't call the pipeline in parallel
- Shopify passes attributes with keys starting with an underscore to the checkout, but doesn't show them there

## Changelog

See [CHANGELOG.md](CHANGELOG.md) file for more information.

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) file for more information.

## About Shopgate

Shopgate is the leading mobile commerce platform.

Shopgate offers everything online retailers need to be successful in mobile. Our leading
software-as-a-service (SaaS) enables online stores to easily create, maintain and optimize native
apps and mobile websites for the iPhone, iPad, Android smartphones and tablets.

## License

This extension is available under the Apache License, Version 2.0.

See the [LICENSE](./LICENSE) file for more information.
