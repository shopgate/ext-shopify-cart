/**
 * Pipeline entry function for the challenge page that chacks if the user is a robot or not.
 */
window.SGPipelineScript.challenge = function () {
  // the user needs to take some action, so close the loading spinner. no page specific code needed
  this.closeLoadingScreen()
  window.SGAppConnector.closeLoadingSpinner()
  this.attachChallengeSubmitListener('shopify-challenge__button')
}

/**
 * Takes the className of the challenge-submit input and adds functionality to show the loading screen.
 *
 * @param {string} className
 */
window.SGPipelineScript.attachChallengeSubmitListener = function (className) {
  if (document.getElementsByClassName(className)) {
    document.getElementsByClassName(className)[0].onclick = function () {
      window.SGPipelineScript.showLoadingScreen()
      return true
    }
  }
}
