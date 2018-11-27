/**
 * Pipeline entry function for the account overview page of the Shopify frontend.
 */
window.SGPipelineScript.account = function () {
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
      'payload': payload,
      'customerId': window.meta.page.customerId
    }
  }

  // call login_v1 pipeline and pass through the shopgateParams data that was sent to the tab when it was opened
  window.SGAppConnector.sendPipelineRequest('shopgate.user.loginUser.v1', true, pipelineInput, function (err, output, shopgateParams) {
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
  }, shopgateParams)
}
