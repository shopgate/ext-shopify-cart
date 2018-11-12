# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Changed
- returns specific code for insufficient stock errors, allowing future templates to show localized error messagesg

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

[Unreleased]: https://stash.localdev.cc/projects/SGX/repos/shopify-cart/compare/commits?targetBranch=refs%2Fheads%2Fmaster&sourceBranch=refs%2Ftags%2Fv1.2.7
[1.2.7]: https://stash.localdev.cc/projects/SGX/repos/shopify-cart/compare/commits?targetBranch=refs%2Ftags%2Fv1.2.6&sourceBranch=refs%2Ftags%2Fv1.2.7
[1.2.6]: https://stash.localdev.cc/projects/SGX/repos/shopify-cart/compare/commits?targetBranch=refs%2Ftags%2Fv1.2.5&sourceBranch=refs%2Ftags%2Fv1.2.6
[1.2.5]: https://stash.localdev.cc/projects/SGX/repos/shopify-cart/compare/commits?targetBranch=refs%2Ftags%2Fv1.2.3&sourceBranch=refs%2Ftags%2Fv1.2.5
[1.2.3]: https://stash.localdev.cc/projects/SGX/repos/shopify-cart/compare/commits?targetBranch=refs%2Ftags%2Fv1.2.2&sourceBranch=refs%2Ftags%2Fv1.2.3
[1.2.2]: https://stash.localdev.cc/projects/SGX/repos/shopify-cart/compare/commits?targetBranch=refs%2Ftags%2Fv1.2.1&sourceBranch=refs%2Ftags%2Fv1.2.2
[1.2.1]: https://stash.localdev.cc/projects/SGX/repos/shopify-cart/browse?at=refs%2Ftags%2Fv1.2.1
