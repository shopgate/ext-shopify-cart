/* eslint-disable */

SGEvent.__init = function () {
  // // reset data on every page except /account
  // if (!getLocation().endsWith('/account')) {
  //   console.log('##### clearing storage #####')
  //   localStorage.removeItem('ShopgateWebloginPayload')
  // }

  // do some basic routing
  if (getLocation().endsWith('/account/login') || getLocation().endsWith('/account/register')) {
    loadPipelineScript('login_register')
  } else if (getLocation().endsWith('/account')) {
    loadPipelineScript('account')
  } else {
    closeLoadingSpinner()
  }
}

function getLocation () {
  return window.location.toString().replace(/[#?].*$/g, '')
}
/* eslint-enable */
