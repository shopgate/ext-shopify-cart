/* eslint-disable */

SGEvent.login_register = function () {
  // attach a click-event-listener to each relevant form-submit button
  if (getLocation().endsWith('/account/login')) {
    attachSubmitListener('customer_login')
  } else if (getLocation().endsWith('/account/register')) {
    attachSubmitListener('create_customer')
  }

  closeLoadingSpinner()
}

function attachSubmitListener(elementName) {
  if (document.getElementById(elementName)) {
    document.getElementById(elementName).querySelector('input[type=\"submit\"]').onclick = function () {
      return initAppLogin(elementName)
    }
  }
}

function checkState(phrase) {
  console.log("Exported phrase: " + phrase)
  console.log("Saved encrypt payload: " + localStorage.getItem('ShopgateWebloginPayload'))
  console.log("Decrypted payload: " + CryptoJS.AES.decrypt(localStorage.getItem('ShopgateWebloginPayload'), phrase).toString(CryptoJS.enc.Utf8))
}

function initAppLogin(formId) {
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
  var phrase = getRandomPassPhrase(14)

  // save get params for later (after registration or login has succeeded)
  var sgcloudCallbackData = getParameterByName('sgcloud_callback_data')
  var sgcloudCheckout = getParameterByName('sgcloud_checkout')
  if (sgcloudCallbackData || sgcloudCheckout) {
    localStorage.setItem('ShopgateParams', JSON.stringify({
      sgcloudCallbackData: sgcloudCallbackData,
      sgcloudCheckout: sgcloudCheckout
    }))
  }

  // store payload to local storage
  localStorage.setItem('ShopgateWebloginPayload', CryptoJS.AES.encrypt(JSON.stringify(payloadData), phrase).toString())

  // prepare pipeline request with base64 encoded phrase as payload
  var appCommands = [{
    c: 'sendPipelineRequest',
    p: {
      serial: 'initWebLogin_v1',
      name: 'initWebLogin_v1',
      input: {
        payload: btoa(phrase)
      },
      type: 'trusted'
    }
  }]

  // checkState(phrase)

  // execute app command
  if ('dispatchCommandsForVersion' in SGJavascriptBridge) {
    SGJavascriptBridge.dispatchCommandsForVersion(appCommands, '12.0')
  } else {
    SGJavascriptBridge.dispatchCommandsStringForVersion(JSON.stringify(appCommands), '12.0')
  }

  // continue form submission
  return true
}

/* eslint-enable */
