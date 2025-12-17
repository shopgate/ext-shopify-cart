
/**
 * @param {SDKContext} context
 * @param {{
 *   sgxsMeta: SgxsMeta
 *   }} input
 */
module.exports = async (context, input) => {
  const { usesCompanyContacts } = context.config
  return { usesCompanyContacts }
}
