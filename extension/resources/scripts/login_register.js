
window.SGPipelineScript.login_register = function () {
  // attach a click-event-listener to each relevant form-submit button
  if (window.SGPipelineScript.getLocation().endsWith('/account/login')) {
    attachSubmitListener('customer_login')
  } else if (window.SGPipelineScript.getLocation().endsWith('/account/register')) {
    attachSubmitListener('create_customer')
  }

  // save get params for later (after registration or login has succeeded)
  var sgcloudCallbackData = window.SGAppConnector.getParameterByName('sgcloud_callback_data')
  var sgcloudCheckout = window.SGAppConnector.getParameterByName('sgcloud_checkout')
  if (sgcloudCallbackData || sgcloudCheckout) {
    window.localStorage.setItem('ShopgateParams', JSON.stringify({
      sgcloudCallbackData: JSON.parse(sgcloudCallbackData),
      sgcloudCheckout: sgcloudCheckout
    }))
  }

  window.SGAppConnector.closeLoadingSpinner()
}

function attachSubmitListener (elementName) {
  if (document.getElementById(elementName)) {
    document.getElementById(elementName).querySelector('input[type="submit"]').onclick = function () {
      return initAppLogin(elementName)
    }
  }
}

function initAppLogin (formId) {
  // read form elements
  var elements = Array.from(document.getElementById(formId).children)
  var payloadData = {}
  var key
  var name
  elements.forEach((el) => {
    if (el.name) {
      key = ''
      name = el.name.replace('customer[', '').replace(']', '')
      if (name === 'email') {
        key = 'u'
      } else if (name === 'password') {
        key = 'p'
      }

      if (key) {
        payloadData[key] = el.value
      }
    }
  })

  // create encryption phrase
  var phrase = window.SGAppConnector.getRandomPassPhrase(16)

  // store payload to local storage
  window.localStorage.setItem('ShopgateWebloginPayload', window.CryptoJS.AES.encrypt(JSON.stringify(payloadData), phrase).toString())

  var pipelineData = {
    phrase: phrase
  }
  window.SGAppConnector.sendPipelineRequest('initWebLogin_v1', true, pipelineData, function (err, output, formId) {
    // submit form, since the pipeline response arrived
    if (!err) {
      document.getElementById(formId).submit()
    }
  }, formId)

  // abort form submission (wait for pipeline response)
  return false
}

/* eslint-enable */
