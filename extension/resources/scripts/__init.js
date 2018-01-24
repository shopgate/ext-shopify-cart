
window.SGPipelineScript.__init = function () {
  // do some basic routing
  if (window.SGPipelineScript.getLocation().endsWith('/account/login') || window.SGPipelineScript.getLocation().endsWith('/account/register')) {
    // reset data on every page except /account
    if (!window.SGPipelineScript.getLocation().endsWith('/account')) {
      window.localStorage.removeItem('ShopgateWebloginPayload')
    }

    window.SGAppConnector.loadPipelineScript('login_register')
  } else if (window.SGPipelineScript.getLocation().endsWith('/account')) {
    window.SGAppConnector.loadPipelineScript('account')
  } else if (window.SGPipelineScript.getLocation().endsWith('/challenge')) {
    // avoid deleting data as this is between registration start and completion
    window.SGAppConnector.closeLoadingSpinner()
  } else {
    // reset data on every page except /account
    if (!window.SGPipelineScript.getLocation().endsWith('/account')) {
      window.localStorage.removeItem('ShopgateWebloginPayload')
    }

    window.SGAppConnector.closeLoadingSpinner()
  }
}

window.SGPipelineScript.getLocation = function () {
  return window.location.toString().replace(/[#?].*$/g, '')
}
