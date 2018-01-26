/**
 * Definition of the basic routes, that matter in this context.
  */
window.SGPipelineScript.PAGE_LOGIN = '/account/login'
window.SGPipelineScript.PAGE_REGISTER = '/account/register'
window.SGPipelineScript.PAGE_ACCOUNT = '/account'
window.SGPipelineScript.PAGE_CHALLENGE = '/challenge'
window.SGPipelineScript.PAGE_CHECKOUTS = '/[0-9]+/checkouts/[0-9a-f]+'

/**
 * Definition af a few global storage keys.
 */
window.SGPipelineScript.STORAGE_KEY_WEBLOGIN_PAYLOAD = 'shopgateWebloginPayload'
window.SGPipelineScript.STORAGE_KEY_TAB_PARAMS = 'shopgateParams'
/**
 * Pipeline entry function.
 *
 * This file routes the call to other script files, if needed, depending on the current location.
 * It also does some minor initialization.
 */
window.SGPipelineScript.__init = function () {
  // do some basic routing
  switch (this.getPage()) {
    case this.PAGE_LOGIN: // same action as PAGE_REGISTER (fall through to next statement)
    case this.PAGE_REGISTER: {
      // Encryption functionality is required here (load crypto-js library)
      window.SGAppConnector.loadRemoteScript(
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js',
        true
      )

      // clear previously stored temporary credentials to avoid conflicts later and forward to page specific script
      window.localStorage.removeItem(this.STORAGE_KEY_WEBLOGIN_PAYLOAD)
      window.SGAppConnector.loadPipelineScript('login_register')
      // leave loading spinner open because the script is not finished, yet
      break
    }
    case this.PAGE_ACCOUNT: {
      // load page specific script
      window.SGAppConnector.loadPipelineScript('account')
      // leave loading spinner open because the script is not finished, yet
      break
    }
    case this.PAGE_CHALLENGE: {
      // the user needs to take some action, so close the loading spinner. no page specific code needed
      window.SGAppConnector.closeLoadingSpinner()
      break
    }
    default: {
      // on every other page the temporarily stored credentials should be removed and the loading spinner be closed
      window.localStorage.removeItem(this.STORAGE_KEY_WEBLOGIN_PAYLOAD)
      window.SGAppConnector.closeLoadingSpinner()
      break
    }
  }
}

/**
 * Parses the current location and returns it as string, without any GET parameters or anker/fragment
 *
 * @return {string}
 */
window.SGPipelineScript.getLocation = function () {
  return window.location.toString().replace(/[#?].*$/g, '')
}

/**
 * Checks the current location and returns the page if it's known and relevant to the extension.
 *
 * @return {string}
 */
window.SGPipelineScript.getPage = function () {
  var currentLocation = this.getLocation().toLowerCase()
  if (currentLocation.match(this.PAGE_LOGIN.toLowerCase() + '/*$')) {
    // page that shows a login form
    return this.PAGE_LOGIN
  } else if (currentLocation.match(this.PAGE_REGISTER.toLowerCase() + '/*$')) {
    // paget that shows a registration form
    return this.PAGE_REGISTER
  } else if (currentLocation.match(this.PAGE_ACCOUNT.toLowerCase() + '/*$')) {
    // accoutn overview page
    return this.PAGE_ACCOUNT
  } else if (currentLocation.match(this.PAGE_CHALLENGE.toLowerCase() + '/*$')) {
    // a page that does a "bot test"
    return this.PAGE_CHALLENGE
  } else if (currentLocation.match(this.PAGE_CHECKOUTS.toLowerCase() + '/*$')) {
    // the checkouts/<hash> page
    return this.PAGE_CHECKOUTS
  }

  // parse the current location and return the last bit of it
  return ('/' + currentLocation.replace(/\/*$/g, '').split('/').pop())
}
