/**
 * Pipeline entry function for the account overview page of the Shopify frontend.
 */
window.SGPipelineScript.account = function () {
  // hide internal processes from the user
  this.showLoadingScreen()

  // check if there was a login or registration before (also clean up localStorage)
  var shopgateWebloginPayload = window.localStorage.getItem(this.STORAGE_KEY_WEBLOGIN_PAYLOAD)
  window.localStorage.removeItem(this.STORAGE_KEY_WEBLOGIN_PAYLOAD)
  if (shopgateWebloginPayload) {
    this.loginInApp(shopgateWebloginPayload)
  }

  window.SGAppConnector.closeLoadingSpinner()
}

/**
 * Takes the payload data, that was encrypted when the login or registration form was sent and uses it to identify
 * the user to set him to "logged in" status in the app and in the Shopgate Connect backend.
 *
 * @param payload
 */
window.SGPipelineScript.loginInApp = function (payload) {
  // read from localStorage and remove it because it's not needed afterwards anymore
  var shopgateParams = window.localStorage.getItem(this.STORAGE_KEY_TAB_PARAMS)
  if (shopgateParams) {
    shopgateParams = JSON.parse(shopgateParams)
  }
  window.localStorage.removeItem(this.STORAGE_KEY_TAB_PARAMS)

  var pipelineInput = {
    'strategy': 'web',
    'parameters': {
      'payload': payload
    }
  }

  // call login_v1 pipeline and pass through the shopgateParams data that was sent to the tab when it was opened
  window.SGAppConnector.sendPipelineRequest('login_v1', true, pipelineInput, function (err, output, shopgateParams) {
    // tell the frontend to switch to "logged in mode"
    if (!err && output.success === true) {
      console.log('# Web login/registration successful. Broadcasting "userLoggedIn" event to the app.')

      window.SGAppConnector.sendAppCommand({
        c: 'broadcastEvent',
        p: {
          event: 'userLoggedIn'
        }
      })
    }

    // the registration or login can be triggered just before checkout or as a standalone action
    if (shopgateParams && shopgateParams.sgcloudCheckout) {
      return window.SGPipelineScript.proceedToCheckout()
    }

    // close loading screen, because otherwise it will even be visible after closing the tab
    window.SGPipelineScript.closeLoadingScreen()

    // close loading screen and close in app browser tab if it was just a standalone action (send back callback data)
    var closeTabData = [(shopgateParams ? shopgateParams.sgcloudCallbackData : {})]
    console.log('# Closing in app browser tab with data: ' + JSON.stringify(closeTabData))
    window.SGAppConnector.sendAppCommand({
      c: 'broadcastEvent',
      p: {
        event: 'closeInAppBrowser',
        data: closeTabData
      }
    })
  }, shopgateParams)
}

/**
 * Fetches the checkout url for the users cart and redirects him to the checkout.
 */
window.SGPipelineScript.proceedToCheckout = function () {
  // take checkout url from cache, clean up and redirect
  var checkoutUrl = window.localStorage.getItem(this.STORAGE_KEY_CHECKOUT_URL)
  window.localStorage.removeItem(this.STORAGE_KEY_CHECKOUT_URL)
  if (checkoutUrl) {
    console.log('# Proceeding to checkout after successfol web login/registration (in app browser).')
    window.location.replace(window.atob(checkoutUrl))
  }
}
