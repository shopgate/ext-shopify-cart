window.SGPipelineScript.cart = function () {
  window.SGAppConnector.sendAppCommand(
    {
      c: 'broadcastEvent',
      p: {
        event: 'closeInAppBrowser'
      }
    }
  )
}
