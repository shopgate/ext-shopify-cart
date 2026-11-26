/**
 * Shopify's `AttributeInput.value` is a non-null string, but attributes read from Shopify may have a `null` value.
 * Converts such values to an empty string, so the attributes can be sent back to Shopify.
 *
 * @param {ShopifyAttribute[]?} attributes
 * @returns {{ key: string, value: string }[]}
 */
const normalizeAttributes = attributes => (attributes || []).map(({ key, value }) => ({
  key,
  value: value === null || value === undefined ? '' : value
}))

/**
 * Merges changes into a list of attributes.
 *
 * - keys not given in `changes` are kept
 * - keys given in `changes` are changed in place, new keys are appended
 * - a `null` value in `changes` removes the key
 * - if a key is given more than once in `changes`, the last one wins
 *
 * @param {ShopifyAttribute[]?} current
 * @param {ShopifyAttribute[]} changes
 * @returns {{ key: string, value: string }[]}
 */
const mergeAttributes = (current, changes) => {
  const pending = new Map(changes.map(({ key, value }) => [key, value]))

  const merged = []
  for (const attribute of normalizeAttributes(current)) {
    if (!pending.has(attribute.key)) {
      merged.push(attribute)
      continue
    }

    const value = pending.get(attribute.key)
    pending.delete(attribute.key)
    if (value !== null) merged.push({ key: attribute.key, value })
  }

  for (const [key, value] of pending) {
    if (value !== null) merged.push({ key, value })
  }

  return merged
}

/**
 * Adds the attributes of `additions` whose keys are not in `current` yet; existing keys keep their values.
 *
 * @param {ShopifyAttribute[]?} current
 * @param {ShopifyAttribute[]?} additions
 * @returns {{ key: string, value: string }[]}
 */
const addMissingAttributes = (current, additions) => {
  const existingKeys = new Set((current || []).map(({ key }) => key))

  return mergeAttributes(current, normalizeAttributes(additions).filter(({ key }) => !existingKeys.has(key)))
}

/**
 * @param {ShopifyAttribute[]} a
 * @param {ShopifyAttribute[]} b
 * @returns {boolean}
 */
const attributesEqual = (a, b) => a.length === b.length &&
  a.every((attribute, index) => attribute.key === b[index].key && attribute.value === b[index].value)

module.exports = { normalizeAttributes, mergeAttributes, addMissingAttributes, attributesEqual }
