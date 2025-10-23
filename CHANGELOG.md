# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [3.4.0] - 2025-10-23
### Added
- support for Shopify Multipass (requires `@shopgate/shopify-user` v3.1.0 or higher)

## [3.3.1] - 2025-09-18
### Added
- logging errors on cart creation (internal/developer use)

## [3.3.0] - 2025-09-08
### Added
- support for locale query in checkout url

## [3.2.0] - 2025-07-18
### Added
- support for use with `@shopgate/catalog-shopify`

## [3.1.0] - 2025-04-30
### Added
- support for B2B carts using the first company contact and location of a customer if set
  (requires Shopify "new customer accounts" and `@shopgate/shopify-user` v2.3.0 or higher)

### Fixed
- line items that are out of stock are not left in the cart with 0 amount anymore (introduced in 3.0.4 with the API
  upgrade)

## [3.0.4] - 2025-04-02
### Changed
- uses Shopify Storefront API 2025-01
- uses Shopify REST Admin API 2025-01

### Fixed
- when adding a product to the cart fails due to availability a proper error message is now shown to the customer

## [3.0.3] - 2024-12-20
### Fixed
- when users logged out on the checkout page or their authentication expired they would stay logged out until completing checkout

## [3.0.2] - 2024-12-19
### Fixed
- mixed up buyer IPs sent to Shopify

## [3.0.1] - 2024-12-18
### Added
- sending the buyer IP along with Storefront API requests as per requirement by Shopify to maintain a consistent checkout experience

## [3.0.0] - 2024-11-06

### Breaking Changes
- requires `@shopgate/shopify-user` v2.2.0 or higher

### Changed
- uses Shopify API version 2024-07 on all endpoints

### Added
- uses the Shopify Storefront API

### Removed
- usage of the deprecated checkout endpoints from the Shopify Admin REST API

### Fixed
- cart immutable after aborting checkout

## [2.2.12] - 2023-10-30
### Changed
- uses Shopify API version 2023-10 on all endpoints

## [2.2.11] - 2023-06-30
### Changed
- uses Shopify API version 2022-10 on all endpoints

## [2.2.10] - 2022-01-06
### Fixed
- errors when adding something into the cart or checking out due to how the Shopify returns data in newer API versions

## [2.2.9] - 2022-12-29
### Fixed
- errors when logging in due to wrong usage of updated dependencies from 2.6.1

## [2.2.8] - 2022-12-29
###  Changed
- uses Shopify API version 2022-07 on all endpoints
- updated vulnerable dependencies

## [2.2.7] - 2020-03-06
### Fixed
- error on app start when unavailable variants are still in the cart

## [2.2.6] - 2020-02-28
### Fixed
- fix bug in cart error handling which caused the error "Class constructor UnknownError cannot be invoked without new"

## [2.2.5] - 2019-10-08
### Fixed
- error on product page when adding out of stock products

## [2.2.4] - 2019-07-01
### Fixed
- autologin if a custom shopify domain is used

## [2.2.3] - 2019-06-05
### Fixed
- update query selector for submit field in login / register
### Added
- versioning for cache

## [2.2.2] - 2019-05-08
### Added
- logs for creation of cart / checkout in case of success and error 
### Fixed
- remove products from the cart that are not available anymore at Shopify
- create new cart if the old one does not exist at Shopify anymore

## [2.2.0] - 2019-04-17
### Added
- added beforeUpdateProductsInCart pipeline hook to updateProducts pipeline
- added afterShopifyCartDataCreation pipeline hook to getCart pipeline

## [2.1.1] - 2019-04-10
### Fixed
- empty cart after registering a new customer
- quantities for products that changed at Shopify

## [2.1.0] - 2019-02-18
### Removed
- coupon/discount related logic as it will be handled in the desktop checkout instead
- usage of tools.js logic
### Changed
- callback functions to async/await ones

## [2.0.0] - 2019-02-07
### Changed
- Updated Web Checkout to be compatible with Shopgate PWA version 6.1 and higher

## [1.2.9] - 2018-12-19
### Fixed
- create new checkout if old one is not available at Shopify anymore

## [1.2.8] - 2018-12-07
### Changed
- returns specific code for insufficient stock errors, allowing future templates to show localized error messages
### Fixed
- cart errors for products that gone out of stock after they were added to the cart

## [1.2.7] - 2018-10-15
### Changed
- Shopify request log format changed to be compatible with `shopify-user`'s log format

## [1.2.6] - 2018-09-28
### Fixed
- auto-login after registration and redirection to app or web checkout

## [1.2.5] - 2018-09-06
### Fixed
- cart product manipulation with errors falsely responds with success, e.g. out of stock error

## [1.2.3] - 2018-08-30
### Fixed
- cart showing duplicate items and wrong quantities when the same product is added multiple times very quickly

## [1.2.2] - 2018-08-30
### Fixed
- "compare at" price is not treated as a discount anymore

## [1.2.1] - 2018-08-30
### Added
- logging request duration and other info when requesting the Shopify API

[Unreleased]: https://github.com/shopgate/ext-shopify-cart/compare/v3.4.0...HEAD
[3.4.0]: https://github.com/shopgate/ext-shopify-cart/compare/v3.3.1...v3.4.0
[3.3.1]: https://github.com/shopgate/ext-shopify-cart/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/shopgate/ext-shopify-cart/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/shopgate/ext-shopify-cart/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/shopgate/ext-shopify-cart/compare/v3.0.4...v3.1.0
[3.0.4]: https://github.com/shopgate/ext-shopify-cart/compare/v3.0.3...v3.0.4
[3.0.3]: https://github.com/shopgate/ext-shopify-cart/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/shopgate/ext-shopify-cart/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/shopgate/ext-shopify-cart/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.12...v3.0.0
[2.2.12]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.11...v2.2.12
[2.2.11]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.10...v2.2.11
[2.2.10]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.9...v2.2.10
[2.2.9]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.8...v2.2.9
[2.2.8]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.7...v2.2.8
[2.2.7]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.6...v2.2.7
[2.2.6]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.5...v2.2.6
[2.2.5]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.4...v2.2.5
[2.2.4]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.3...v2.2.4
[2.2.3]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/shopgate/ext-shopify-cart/compare/v2.2.0...v2.2.2
[2.2.0]: https://github.com/shopgate/ext-shopify-cart/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/shopgate/ext-shopify-cart/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/shopgate/ext-shopify-cart/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/shopgate/ext-shopify-cart/compare/v1.2.9...v2.0.0
[1.2.9]: https://github.com/shopgate/ext-shopify-cart/compare/v1.2.8...v1.2.9
[1.2.8]: https://github.com/shopgate/ext-shopify-cart/compare/v1.2.7...v1.2.8
[1.2.7]: https://github.com/shopgate/ext-shopify-cart/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/shopgate/ext-shopify-cart/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/shopgate/ext-shopify-cart/compare/v1.2.3...v1.2.5
[1.2.3]: https://github.com/shopgate/ext-shopify-cart/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/shopgate/ext-shopify-cart/compare/v1.2.1...v1.2.2
