/**
 * @param {Object} context
 * @param {{
 *   pipelineId: string,
 *   scopeId: string,
 *   startTime: number
 * }} input
 */
module.exports = async (context, input) => {
  const { pipelineId, scopeId, startTime } = input
  const elapsedTime = Date.now() - startTime
  context.log.debug({ pipelineId, scopeId, elapsedTime }, 'Stopped timer')
}
