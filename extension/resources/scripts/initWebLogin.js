/* eslint-disable */

function runPipelineScript () {
  // attach a click-event-listener to each relevant form-submit button
  attachSubmitListener('customer_login')
  attachSubmitListener('create_customer')
}

function getParameterByName(paramName, url) {
  if (!url) {
    url = window.location.href
  }

  paramName = paramName.replace(/[\[\]]/g, "\\$&")
  var regex = new RegExp("[?&]" + paramName + "(=([^&#]*)|&|#|$)")
  results = regex.exec(url)

  if (!results) {
    return null
  }

  if (!results[2]) {
    return ''
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "))
}

function attachSubmitListener(elementName) {
  if (document.getElementById(elementName)) {
    document.getElementById(elementName).querySelector('input[type=\"submit\"]').onclick = function () {
      return initAppLogin(elementName)
    }
  }
}

function getRandomPassPhrase(len) {
  if (!len) len = 16
  return Array(len).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!§$%&/()=?ß+*~#'-_.:,;<>|{[]}^°").map(function(x) {
    return x[Math.floor(Math.random() * x.length)]
  }).join('')
}

function checkState(phrase) {
  console.log("Exported phrase: " + phrase)
  console.log("Saved encrypt payload: " + localStorage.getItem('ShopgateWebloginPayload'))
  console.log("Decrypted payload: " + CryptoJS.AES.decrypt(localStorage.getItem('ShopgateWebloginPayload'), phrase).toString(CryptoJS.enc.Utf8))
  return true
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
