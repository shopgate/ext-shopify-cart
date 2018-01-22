/* eslint-disable */

SGEvent.account = function () {
  // try to log in inside the app when the account page is loaded
  if (getLocation().endsWith('/account')) {
    console.log("running account page")

    // check if there was a login or registration before
    var ShopgateWebloginPayload = localStorage.getItem('ShopgateWebloginPayload')
    console.log("called: execWebLogin. received data: " + ShopgateWebloginPayload)
    if (ShopgateWebloginPayload) {
      loginInApp(ShopgateWebloginPayload)
    }
  }

  closeLoadingSpinner()
}

function loginInApp(payload) {
  console.log("called: loginInApp")
  var pipelineInput = {
    "strategy":"web",
    "parameters": {
      "payload": payload
    }
  }

  sendPipelineRequest('login_v1', true, pipelineInput, function (err, output) {
    console.log("called: login_v1 response: " + JSON.stringify({err: err, output: output}))
    // tell the frontend to switch to "logged in mode"
    if (!err && output.success === true) {
      sendAppCommand({
        'c': 'broadcastEvent',
        'p': {
          'event': 'userLoggedIn'
        }
      })
    }

    // proceed to checkout if it was a checkout-registration
    var ShopgateParams = localStorage.getItem('ShopgateParams')
    if (ShopgateParams.sgcloudCheckout) {
      return proceedToCheckout()
    }

    // close in app browser tab otherwise (also send back the callback data)
    sendAppCommand({
      'c': 'broadcastEvent',
      'p': {
        'event': 'closeInAppBrowser',
        'data' : ShopgateParams.sgcloudCallbackData
      }
    })
  })
}

function proceedToCheckout () {
  sendPipelineRequest('getCheckoutUrl_v1', false, function (err, output) {
    window.location.replace(output.url)
  })
}

/* eslint-enable */
