const assert = require('assert')

describe('Cart Helper', () => {
  describe('extractVariantId', () => {
    const extractVariantId = require('../../../../extension/helper/cart').extractVariantId

    it('should return null if "product" arg evaluates to false', () => {
      assert.strictEqual(extractVariantId(), null)
      assert.strictEqual(extractVariantId(undefined), null)
      assert.strictEqual(extractVariantId(null), null)
      assert.strictEqual(extractVariantId(false), null)
      assert.strictEqual(extractVariantId(0), null)
      assert.strictEqual(extractVariantId(''), null)
    })

    it('should return null if "product" arg is not an object', () => {
      assert.strictEqual(extractVariantId(123), null)
      assert.strictEqual(extractVariantId('123'), null)
      assert.strictEqual(extractVariantId(true), null)
      assert.strictEqual(extractVariantId([1, 2, 3]), null)
    })

    it('should return null if "product" arg has no "customData"', () => {
      assert.strictEqual(extractVariantId({}), null)
      assert.strictEqual(extractVariantId({ customData: null }), null)
      assert.strictEqual(extractVariantId({ customData: false }), null)
      assert.strictEqual(extractVariantId({ customData: '' }), null)
      assert.strictEqual(extractVariantId({ customData: 0 }), null)
    })

    it('should return null when "product.customData" does not contain a variant_id', () => {
      assert.strictEqual(extractVariantId({ customData: 123 }), null)
      assert.strictEqual(extractVariantId({ customData: '123' }), null)
      assert.strictEqual(extractVariantId({ customData: true }), null)
      assert.strictEqual(extractVariantId({ customData: '[]' }), null)
      assert.strictEqual(extractVariantId({ customData: '[1, 2, 3]' }), null)
      assert.strictEqual(extractVariantId({ customData: '{"a": 1, "b": 2, "c": 3}' }), null)
      assert.strictEqual(extractVariantId({ customData: '{"variant_id": null}' }), null)
      assert.strictEqual(extractVariantId({ customData: '{"variant_id": false}' }), null)
      assert.strictEqual(extractVariantId({ customData: '{"variant_id": 0}' }), null)
      assert.strictEqual(extractVariantId({ customData: '{"variant_id": ""}' }), null)
    })

    it('should throw a SyntaxError when "product.customData" is not valid JSON', () => {
      const testArgs = [
        [],
        [1, 2, 3],
        {},
        { a: 1, b: 2, c: 3 },
        '{lol'
      ]

      testArgs.forEach(arg => {
        try {
          extractVariantId({ customData: arg })
          assert.fail('Expected a SyntaxError to be thrown; none thrown.')
        } catch (err) {
          if (!(err instanceof SyntaxError)) {
            console.error(err)
            assert.fail('Expected a SyntaxError to be thrown, got different error (see above) instead.')
          }
        }
      })
    })

    it('should return a variant ID if "product.customData" does include one', () => {
      assert.strictEqual(extractVariantId({customData: '{"variant_id": "123"}'}), '123')
    })
  })

  describe('handleCartError', () => {
    const handleCartError = require('../../../../extension/helper/cart').handleCartError

    it('should throw the error if it is not in the expected format', () => {
      const testArgs = [
        new Error('not what we expected'),
        { errors: { message: 'still not what we expected' } },
        { errors: { line_items: false } }
      ]

      testArgs.forEach(arg => {
        try {
          handleCartError(arg)
          assert.fail('Expected an error to be thrown; none thrown.')
        } catch (err) {
          // all fine
        }
      })
    })

    it('should return a "flattened" summary of all error messages', () => {
      const error = new Error()
      error.errors = {
        line_items: {
          0: {
            quantity: [
              { code: 'some_error_code', message: 'some message' },
              { code: 'some_other_error_code', message: 'some other message' }
            ],
            stuff: [
              { code: 'stuff_error_code', message: 'stuff message' },
              { code: 'stuff_other_error_code', message: 'stuff other message' }
            ]
          },
          4: {
            lol: [
              { code: 'lol_code', message: 'lol' },
              { code: 'rofl_code', message: 'rofl' }
            ],
            rofl: [
              { code: 'lolz_code', message: 'lolz' },
              { code: 'roflmao_code', message: 'roflmao' }
            ]
          }
        }
      }

      assert.deepStrictEqual(
        handleCartError(error),
        [
          { code: 'some_error_code', message: 'some message', type: 'error' },
          { code: 'some_other_error_code', message: 'some other message', type: 'error' },
          { code: 'stuff_error_code', message: 'stuff message', type: 'error' },
          { code: 'stuff_other_error_code', message: 'stuff other message', type: 'error' },
          { code: 'lol_code', message: 'lol', type: 'error' },
          { code: 'rofl_code', message: 'rofl', type: 'error' },
          { code: 'lolz_code', message: 'lolz', type: 'error' },
          { code: 'roflmao_code', message: 'roflmao', type: 'error' }
        ]
      )
    })

    it('should convert "not_enough_in_stock" error codes into "EINSUFFICIENTSTOCK"', () => {
      const error = new Error()
      error.errors = {
        line_items: {
          0: {
            quantity: [
              { code: 'not_enough_in_stock', message: 'some message' }
            ]
          }
        }
      }

      assert.deepStrictEqual(
        handleCartError(error),
        [{ code: 'EINSUFFICIENTSTOCK', message: 'some message', type: 'error' }]
      )
    })
  })

  describe('getOutOfStockLineItemIds', () => {
    const getOutOfStockLineItemIds = require('../../../../extension/helper/cart').getOutOfStockLineItemIds

    it('should return id of line item with error "not_enough_in_stock" and remaining quantity 0', () => {
      const lineItems = {
        0: {
          quantity: [
            {code: 'not_enough_in_stock', message: 'some message', options: {remaining: 0}}
          ]
        }
      }

      assert.deepStrictEqual(
        getOutOfStockLineItemIds(lineItems),
        [0]
      )
    })

    it('should NOT return id of line item with error "not_enough_in_stock" and remaining quantity > 0', () => {
      const lineItems = {
        0: {
          quantity: [
            {code: 'not_enough_in_stock', message: 'some message', options: {remaining: 2}}
          ]
        }
      }

      assert.deepStrictEqual(
        getOutOfStockLineItemIds(lineItems),
        []
      )
    })

    it('should return all id of line item with error "not_enough_in_stock" and remaining quantity = 0', () => {
      const lineItems = {
        0: {
          quantity: [
            {code: 'not_enough_in_stock', message: 'some message', options: {remaining: 0}}
          ]
        },
        1: {
          quantity: [
            {code: 'not_enough_in_stock', message: 'some message', options: {remaining: 2}}
          ]
        },
        2: {
          quantity: [
            {code: 'not_enough_in_stock', message: 'some message', options: {remaining: 0}}
          ]
        }
      }

      assert.deepStrictEqual(
        getOutOfStockLineItemIds(lineItems),
        [0, 2]
      )
    })
  })
})
