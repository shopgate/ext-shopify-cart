
window.SGPipelineScript.account = function () {
  // try to log in inside the app when the account page is loaded
  if (window.SGPipelineScript.getLocation().endsWith('/account')) {
    // check if there was a login or registration before
    var ShopgateWebloginPayload = window.localStorage.getItem('ShopgateWebloginPayload')
    if (ShopgateWebloginPayload) {
      loginInApp(ShopgateWebloginPayload)
    }
  }

  window.SGAppConnector.closeLoadingSpinner()
}

function loginInApp (payload) {
  var pipelineInput = {
    'strategy': 'web',
    'parameters': {
      'payload': payload // window.btoa(payload)
    }
  }

  window.SGAppConnector.sendPipelineRequest('login_v1', true, pipelineInput, function (err, output) {
    // tell the frontend to switch to "logged in mode"
    if (!err && output.success === true) {
      window.SGAppConnector.sendAppCommand({
        'c': 'broadcastEvent',
        'p': {
          'event': 'userLoggedIn'
        }
      })
    }

    // proceed to checkout if it was a checkout-registration
    var ShopgateParams = window.localStorage.getItem('ShopgateParams')
    if (ShopgateParams) {
      ShopgateParams = JSON.parse(ShopgateParams)
    }

    if (ShopgateParams && ShopgateParams.sgcloudCheckout) {
      return proceedToCheckout()
    }

    // close in app browser tab otherwise (also send back the callback data)
    window.SGAppConnector.sendAppCommand({
      'c': 'broadcastEvent',
      'p': {
        'event': 'closeInAppBrowser',
        'data': ShopgateParams ? ShopgateParams.sgcloudCallbackData : {}
      }
    })
  })
}

function proceedToCheckout () {
  window.SGAppConnector.sendPipelineRequest('getCheckoutUrl_v1', false, null, function (err, output) {
    if (err) {
      return console.error(err)
    }

    window.location.replace(output.url)
  })
}
