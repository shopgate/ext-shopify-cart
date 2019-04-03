window.SGPipelineScript.cart = function () {
  console.log('fire closeInAppBrowser')
  window.SGAppConnector.sendAppCommand(
    {
      c: 'broadcastEvent',
      p: {
        event: 'closeInAppBrowser'
      }
    }
  )
}
