const assert = require('assert')
const { normalizeAttributes, mergeAttributes, addMissingAttributes, attributesEqual } = require('../../../helper/attributes')

describe('helper/attributes', () => {
  describe('normalizeAttributes', () => {
    it('should convert null and undefined values to empty strings', () => {
      assert.deepStrictEqual(
        normalizeAttributes([{ key: 'a', value: null }, { key: 'b' }, { key: 'c', value: 'x' }]),
        [{ key: 'a', value: '' }, { key: 'b', value: '' }, { key: 'c', value: 'x' }]
      )
    })

    it('should return an empty array for null or undefined', () => {
      assert.deepStrictEqual(normalizeAttributes(null), [])
      assert.deepStrictEqual(normalizeAttributes(undefined), [])
    })

    it('should drop properties other than key and value', () => {
      assert.deepStrictEqual(normalizeAttributes([{ key: 'a', value: 'x', foo: 'bar' }]), [{ key: 'a', value: 'x' }])
    })
  })

  describe('mergeAttributes', () => {
    const current = [{ key: 'customer_type', value: 'b2b' }, { key: 'source', value: 'app' }]

    it('should keep keys that are not given', () => {
      assert.deepStrictEqual(mergeAttributes(current, []), current)
    })

    it('should change existing keys in place', () => {
      assert.deepStrictEqual(
        mergeAttributes(current, [{ key: 'customer_type', value: 'b2c' }]),
        [{ key: 'customer_type', value: 'b2c' }, { key: 'source', value: 'app' }]
      )
    })

    it('should append new keys', () => {
      assert.deepStrictEqual(
        mergeAttributes(current, [{ key: 'new', value: '1' }]),
        [...current, { key: 'new', value: '1' }]
      )
    })

    it('should remove keys with a null value', () => {
      assert.deepStrictEqual(mergeAttributes(current, [{ key: 'customer_type', value: null }]), [{ key: 'source', value: 'app' }])
    })

    it('should ignore null values for keys that do not exist', () => {
      assert.deepStrictEqual(mergeAttributes(current, [{ key: 'unknown', value: null }]), current)
    })

    it('should use the last value if a key is given more than once', () => {
      assert.deepStrictEqual(
        mergeAttributes([], [{ key: 'a', value: '1' }, { key: 'a', value: '2' }]),
        [{ key: 'a', value: '2' }]
      )
      assert.deepStrictEqual(mergeAttributes(current, [{ key: 'source', value: 'x' }, { key: 'source', value: null }]), [current[0]])
    })

    it('should normalize null values of the current attributes', () => {
      assert.deepStrictEqual(mergeAttributes([{ key: 'a', value: null }], [{ key: 'b', value: '1' }]), [
        { key: 'a', value: '' },
        { key: 'b', value: '1' }
      ])
    })

    it('should not modify the arrays passed', () => {
      const currentCopy = JSON.parse(JSON.stringify(current))
      const changes = [{ key: 'customer_type', value: null }]
      mergeAttributes(current, changes)
      assert.deepStrictEqual(current, currentCopy)
      assert.deepStrictEqual(changes, [{ key: 'customer_type', value: null }])
    })
  })

  describe('addMissingAttributes', () => {
    it('should keep the existing values and only add keys that are missing', () => {
      assert.deepStrictEqual(
        addMissingAttributes(
          [{ key: 'customer_type', value: 'b2b' }],
          [{ key: 'customer_type', value: 'b2c' }, { key: 'source', value: 'app' }]
        ),
        [{ key: 'customer_type', value: 'b2b' }, { key: 'source', value: 'app' }]
      )
    })

    it('should add null values of the additions as empty strings', () => {
      assert.deepStrictEqual(addMissingAttributes([], [{ key: 'a', value: null }]), [{ key: 'a', value: '' }])
    })

    it('should handle missing lists', () => {
      assert.deepStrictEqual(addMissingAttributes(null, [{ key: 'a', value: '1' }]), [{ key: 'a', value: '1' }])
      assert.deepStrictEqual(addMissingAttributes([{ key: 'a', value: '1' }], null), [{ key: 'a', value: '1' }])
    })
  })

  describe('attributesEqual', () => {
    it('should compare keys, values and order', () => {
      assert.strictEqual(attributesEqual([{ key: 'a', value: '1' }], [{ key: 'a', value: '1' }]), true)
      assert.strictEqual(attributesEqual([], []), true)
      assert.strictEqual(attributesEqual([{ key: 'a', value: '1' }], [{ key: 'a', value: '2' }]), false)
      assert.strictEqual(attributesEqual([{ key: 'a', value: '1' }], []), false)
      assert.strictEqual(
        attributesEqual([{ key: 'a', value: '1' }, { key: 'b', value: '2' }], [{ key: 'b', value: '2' }, { key: 'a', value: '1' }]),
        false
      )
    })
  })
})
