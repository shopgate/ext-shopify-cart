const assert = require('assert')

describe('Cart Helper', () => {
  describe('extractVariantId', () => {
    let extractVariantId
    before(() => {
      extractVariantId = require('../../../../extension/helper/cart').extractVariantId
    })

    it('should return null if "product" arg evaluates to false', done => {
      assert.strictEqual(extractVariantId(), null)
      assert.strictEqual(extractVariantId(undefined), null)
      assert.strictEqual(extractVariantId(null), null)
      assert.strictEqual(extractVariantId(false), null)
      assert.strictEqual(extractVariantId(0), null)
      assert.strictEqual(extractVariantId(''), null)
      done()
    })

    it('should return null if "product" arg is not an object', done => {
      assert.strictEqual(extractVariantId(123), null)
      assert.strictEqual(extractVariantId('123'), null)
      assert.strictEqual(extractVariantId(true), null)
      assert.strictEqual(extractVariantId([1, 2, 3]), null)
      done()
    })

    it('should return null if "product" arg has no "customData"', done => {
      assert.strictEqual(extractVariantId({}), null)
      assert.strictEqual(extractVariantId({customData: null}), null)
      assert.strictEqual(extractVariantId({customData: false}), null)
      assert.strictEqual(extractVariantId({customData: ''}), null)
      assert.strictEqual(extractVariantId({customData: 0}), null)
      done()
    })

    it('should return null when "product.customData" does not contain a variant_id', done => {
      assert.strictEqual(extractVariantId({customData: 123}), null)
      assert.strictEqual(extractVariantId({customData: '123'}), null)
      assert.strictEqual(extractVariantId({customData: true}), null)
      assert.strictEqual(extractVariantId({customData: '[]'}), null)
      assert.strictEqual(extractVariantId({customData: '[1, 2, 3]'}), null)
      assert.strictEqual(extractVariantId({customData: '{"a": 1, "b": 2, "c": 3}'}), null)
      assert.strictEqual(extractVariantId({customData: '{"variant_id": null}'}), null)
      assert.strictEqual(extractVariantId({customData: '{"variant_id": false}'}), null)
      assert.strictEqual(extractVariantId({customData: '{"variant_id": 0}'}), null)
      assert.strictEqual(extractVariantId({customData: '{"variant_id": ""}'}), null)
      done()
    })

    it('should throw a SyntaxError when "product.customData" is not valid JSON', done => {
      const testArgs = [
        [],
        [1, 2, 3],
        {},
        {a: 1, b: 2, c: 3},
        '{lol'
      ]

      testArgs.forEach(arg => {
        try {
          extractVariantId({customData: arg})
          assert.fail('Expected a SyntaxError to be thrown; none thrown.')
        } catch (err) {
          if (!(err instanceof SyntaxError)) {
            console.error(err)
            assert.fail('Expected a SyntaxError to be thrown, got different error (see above) instead.')
          }
        }
      })

      done()
    })

    it('should return a variant ID if "product.customData" does include one', done => {
      assert.strictEqual(extractVariantId({customData: '{"variant_id": "123"}'}), '123')
      done()
    })
  })
})
