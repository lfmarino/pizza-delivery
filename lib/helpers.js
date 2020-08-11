/*
 * Helpers for various tasks
 *
 */

// Dependencies
const crypto = require('crypto')
const config = require('../lib/config')
const queryString = require('querystring')
const https = require('https')
const path = require('path')
const fs = require('fs')

// Container for all the helpers
let helpers = {};

// Create a SHA256 hash
helpers.hash = str => {
  if (typeof (str) === 'string' && str.length > 0)
    return crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex')
  else
    return false
}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = str => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return e
  }
}

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = strLength => {
  strLength = typeof (strLength) === 'number' &&
  strLength > 0 ?
    strLength :
    false

  if (strLength) {
    // Define all the possible characters could go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = ''

    for (let i = 1; i <= strLength; i++) {
      // Get a random character from the possible characters string
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))

      // Append this character to the final string
      str += randomCharacter
    }

    // Return the final string
    return str
  } else {
    return false;
  }
}

// Create order
helpers.createOrder = (amount, receipt_email, callback) => {
  // Configure the request payload
  const payload = {
    amount,
    currency: 'usd',
    'payment_method_types[]': 'card',
    receipt_email,
    confirm: true,
    payment_method: 'pm_card_visa'
  }

  // Stringify the payload
  const stringPayload = queryString.stringify(payload)

  // Configure the request details
  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.stripe.com',
    method: 'POST',
    path: '/v1/payment_intents',
    auth: `${config.stripe.secret}`
  }

  // Instantiate the request object
  const req = https.request(requestDetails, res => {
    // Grab the status of the request object
    const status = res.statusCode

    // Answer the status and the message from the Stripe API
    res.on('data', data => callback(status, JSON.parse(data.toString())))
  })

  // Bind the error event so it doesn't get thrown
  req.on('error', err => callback(status, err))

  // Add the payload
  req.write(stringPayload)

  // End the request
  req.end()
}

// Send mail
helpers.mail = (receipt_email, subject, message, callback) => {
  // Validate parameters
  receipt_email = typeof receipt_email === 'string' &&
  receipt_email.trim().length > 0 ?
    receipt_email.trim() :
    false

  subject = typeof subject === 'string' &&
  subject.trim().length > 0 &&
  subject.trim().length <= 1600 ?
    subject.trim() :
    false

  message = typeof message === 'string' &&
  message.trim().length > 0 &&
  message.trim().length <= 1600 ?
    message.trim() :
    false

  if (receipt_email && subject && message) {
    // Configure the request payload
    const payload = {
      from: `Pizza Delivery <mailgun@${config.mailgun.domain}>`,
      to: receipt_email,
      subject,
      text: message
    }

    // Stringify the payload
    const stringPayload = queryString.stringify(payload)

    // Configure the request details
    const requestDetails = {
      protocol: 'https:',
      hostname: config.mailgun.base_url,
      method: 'POST',
      path: `${config.mailgun.path}${config.mailgun.domain}/messages`,
      auth: `api:${config.mailgun.api_key}`,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Content-length': Buffer.byteLength(stringPayload)
      }
    }

    // Instantiate the request object
    const req = https.request(requestDetails, res => {
      // Grab the status of the request object
      const status = res.statusCode

      // Callback successfully if the request went through
      if (status === 200 || status === 201)
        callback(false);
      else
        callback(`Status code returned was ${status}`)
    })

    // Bind the error event so it doesn't get thrown
    req.on('error', err => callback(err))

    // Add the payload
    req.write(stringPayload)

    // End the request
    req.end()
  } else {
    callback(400, { Error: 'Missing required email fields' })
  }
}

// Get the total amount of user's shopping cart
helpers.totalAmount = data => data.reduce((acc, cur) => acc + cur.price * 100, 0)

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
  str = typeof str === 'string' && str.length > 0 ? str : ''
  data = typeof data === 'object' && data !== null ? data : {}

  // Add the templateGlobals to the data object, prepending their key name with "global"
  for (let keyName in config.templateGlobals)
    if (config.templateGlobals.hasOwnProperty(keyName))
      data[ `global.${keyName}` ] = config.templateGlobals[ keyName ]

  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (let key in data)
    if (data.hasOwnProperty(key) && typeof data[ key ] === 'string') {
      const replace = data[ key ]
      const find = `{${key}}`

      str = str.replace(find, replace)
    }

  return str
}

// Get the string content of a template
helpers.getTemplate = (templateName, data, callback) => {
  templateName = typeof templateName === 'string' &&
  templateName.length > 0 ?
    templateName :
    false

  data = typeof data === 'object' &&
  data !== null ?
    data :
    {}

  if (templateName) {
    const templatesDir = path.join(__dirname, '/../templates/')

    fs.readFile(`${templatesDir}${templateName}.html`, 'utf8', (err, str) => {
      if (!err && str && str.length > 0) {
        // Do interpolation on the string
        const finalString = helpers.interpolate(str, data)

        callback(false, finalString)
      } else
        callback('No template could be found')
    })
  } else {
    callback('A valid template name was not specified')
  }
}

// Add the universal header and footer to a string, and pass provided data object to the header an footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
  str = typeof str === 'string' && str.length > 0 ? str : ''
  data = typeof data === 'object' && data !== null ? data : {}

  // Get the header
  helpers.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString)
      // Get the footer
      helpers.getTemplate('_footer', data, (err1, footerString) => {
        if (!err1 && footerString) {
          // Add them all together
          const fullString = headerString + str + footerString

          callback(false, fullString)
        } else {
          callback('Could not find the footer template')
        }
      })
    else
      callback('Could not find the header template')
  })
}

// Get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, callback) => {
  fileName = typeof (fileName) === 'string' &&
  fileName.length > 0 ?
    fileName :
    false

  if (fileName) {
    const publicDir = path.join(__dirname,'/../public/')
    fs.readFile(publicDir+fileName, (err, data) => {
      if (!err && data)
        callback(false, data)
      else
        callback('No file could be found')
    })
  } else {
    callback('A valid file name was not specified')
  }
}

// Export the module
module.exports = helpers