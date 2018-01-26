/**
 * Pipeline entry function for the account overview page of the Shopify frontend.
 */
window.SGPipelineScript.account = function () {
  // try to log in inside the app when the account page is loaded
  if (window.SGPipelineScript.getLocation().endsWith('/account')) {
    // check if there was a login or registration before (also clean up localStorage)
    var ShopgateWebloginPayload = window.localStorage.getItem('ShopgateWebloginPayload')
    window.localStorage.removeItem('ShopgateWebloginPayload')
    if (ShopgateWebloginPayload) {
      loginInApp(ShopgateWebloginPayload)
    }
  }

  window.SGAppConnector.closeLoadingSpinner()
}

/**
 * Takes the payload data, that was encrypted when the login or registration form was sent and uses it to identify
 * the user to set him to "logged in" status in the app and in the Shopgate Connect backend.
 *
 * @param payload
 */
function loginInApp (payload) {
  // read from localStorage and remove it because it's not needed afterwards anymore
  var ShopgateParams = window.localStorage.getItem('ShopgateParams')
  if (ShopgateParams) {
    ShopgateParams = JSON.parse(ShopgateParams)
  }
  window.localStorage.removeItem('ShopgateParams')

  var pipelineInput = {
    'strategy': 'web',
    'parameters': {
      'payload': payload
    }
  }

  // call login_v1 pipeline and pass through the ShopgateParams data that was sent to the tab when it was opened
  window.SGAppConnector.sendPipelineRequest('login_v1', true, pipelineInput, function (err, output, ShopgateParams) {
    // tell the frontend to switch to "logged in mode"
    if (!err && output.success === true) {
      console.log('# Web login/registration successful. Broadcasting "userLoggedIn" event to the app.')

      window.SGAppConnector.sendAppCommand({
        'c': 'broadcastEvent',
        'p': {
          'event': 'userLoggedIn'
        }
      })
    }

    // the registration or login can be triggered just before checkout or as a standalone action
    if (ShopgateParams && ShopgateParams.sgcloudCheckout) {
      return proceedToCheckout()
    }

    // close in app browser tab if it was just a standalone action (also send back the callback data)
    var closeTabData = [(ShopgateParams ? ShopgateParams.sgcloudCallbackData : {})]
    console.log('# Closing in app browser tab with data: ' + JSON.stringify(closeTabData))
    window.SGAppConnector.sendAppCommand({
      'c': 'broadcastEvent',
      'p': {
        'event': 'closeInAppBrowser',
        'data': closeTabData
      }
    })
  }, ShopgateParams)
}

/**
 * Fetches the checkout url for the users cart and redirects him to the checkout.
 */
function proceedToCheckout () {
  window.SGAppConnector.sendPipelineRequest('getCheckoutUrl_v1', false, null, function (err, output) {
    if (err) {
      return console.error(err)
    }

    console.log('# Proceeding to checkout after successfol web login/registration (in app browser).')
    window.location.replace(output.url)
  })
}
