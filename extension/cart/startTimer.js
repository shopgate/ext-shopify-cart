/**
 * @param {Object} context
 * @param {{
 *   scopeId: string
 * }} input
 * @returns {Promise<{ pipelineId: string, scopeId: string, startTime: number }>}
 */
module.exports = async (context, input) => {
  let { scopeId, pipelineId } = input

  if (!pipelineId) {
    pipelineId = `${Math.floor(Math.random() * 100000)}`
  }

  const startTime = Date.now()
  return { pipelineId, scopeId, startTime }
}
