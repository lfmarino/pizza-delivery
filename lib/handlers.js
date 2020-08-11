/*
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Define the handlers
const handlers = {}

/*
 *HTML Handlers
 *
 */

// Favicon
handlers.favicon = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get')
    // Read in the favicon's data
    helpers.getStaticAsset('favicon.ico', (err, data) => {
      if (!err && data)
        // Callback the data
        callback(200, data, 'favicon')
      else
        callback(500)
    })
  else
    callback(405)
}

// Public assets
handlers.public = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    //  Get the filename being requested
    const trimmedAssetName = data.trimmedPath.replace('public/', '').trim()

    if (trimmedAssetName.length > 0) {
      // Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if (!err && data) {
          // Determine the content type (default to plain text)
          let contentType = 'plain'

          if (trimmedAssetName.indexOf('.css') > -1)
            contentType = 'css'

          if (trimmedAssetName.indexOf('.png') > -1)
            contentType = 'png'

          if (trimmedAssetName.indexOf('.jpg') > -1)
            contentType = 'jpg'

          if (trimmedAssetName.indexOf('.ico') > -1)
            contentType = 'favicon'

          // Callback the data
          callback(200, data, contentType)
        } else {
          callback(400)
        }
      })
    } else {
      callback(400)
    }
  } else {
    callback(405)
  }
}

handlers.index = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Pizza delivery',
      'head.description': `Pizza delivery site to buy your favorite pizzas without leave your home`,
      'body.class': 'index'
    }

    // Read in a template as a string
    helpers.getTemplate('index', templateData, (err, str) => {
      if (!err && str)
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str)
            // Return the page as HTML
            callback(200, str, 'html')
          else
            callback(500, undefined, 'html')
        })
      else
        callback(500, undefined, 'html')
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Create account
handlers.accountCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Create an account',
      'head.description': `Sign up is easy and only takes a few seconds`,
      'body.class': 'accountCreate'
    }

    // Read in a template as a string
    helpers.getTemplate('accountCreate', templateData, (err, str) => {
      if (!err && str)
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str)
            // Return the page as HTML
            callback(200, str, 'html')
          else
            callback(500, undefined, 'html')
        })
      else
        callback(500, undefined, 'html')
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Create new session
handlers.sessionCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Login to your account',
      'head.description': `Please enter your email and password to access to your account`,
      'body.class': 'sessionCreate'
    }

    // Read in a template as a string
    helpers.getTemplate('sessionCreate', templateData, (err, str) => {
      if (!err && str)
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str)
            // Return the page as HTML
            callback(200, str, 'html')
          else
            callback(500, undefined, 'html')
        })
      else
        callback(500, undefined, 'html')
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Session has been deleted
handlers.sessionDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Logged out',
      'head.description': `You have been logged out of your account`,
      'body.class': 'sessionDeleted'
    }

    // Read in a template as a string
    helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
      if (!err && str)
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str)
            // Return the page as HTML
            callback(200, str, 'html')
          else
            callback(500, undefined, 'html')
        })
      else
        callback(500, undefined, 'html')
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Dashboard (view all checks)
handlers.dashboard = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Dashboard',
      'body.class': 'dashboard'
    }

    // Read in a template as a string
    helpers.getTemplate('dashboard', templateData, (err, str) => {
      if (!err && str)
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str)
            // Return the page as HTML
            callback(200, str, 'html')
          else
            callback(500, undefined, 'html')
        })
      else
        callback(500, undefined, 'html')
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Container for the users sub-methods
handlers._users = {}

// Users
handlers.users = (payload, callback) => {
  const acceptableMethods = [ 'get', 'post', 'put', 'delete' ];
  if (acceptableMethods.indexOf(payload.method) > -1)
    handlers._users[ payload.method ](payload, callback)
  else
    callback(405)
}

// Users post
// Required data: firstName, lastName, password, email, street address
// Optional data: none
handlers._users.post = (data, callback) => {
  // Check that all required fields are filled out
  const firstName = typeof (data.payload.firstName) === 'string' &&
  data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() :
    false;

  const lastName = typeof (data.payload.lastName) === 'string' &&
  data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() :
    false;

  const password = typeof (data.payload.password) === 'string' &&
  data.payload.password.trim().length > 0 ?
    data.payload.password.trim() :
    false;

  const email = typeof (data.payload.email) === 'string' &&
  data.payload.email.trim().length > 0 ?
    data.payload.email.trim() :
    false;

  const streetAddress = typeof (data.payload.streetAddress) === 'string' &&
  data.payload.streetAddress.trim().length > 0 ?
    data.payload.streetAddress.trim() :
    false;

  if (firstName && lastName && password && email && streetAddress) {
    // Make sure that the user doesn't already exist
    _data.read('users', email, err => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            hashedPassword,
            email,
            streetAddress
          }

          // Store the user
          _data.create('users', email, userObject, err => {
            if (!err) {
              callback(200)
            } else {
              console.error(err)
              callback(500, { Error: 'Could not create new user. See the console log' })
            }
          })
        } else {
          callback(500, { Error: 'Could not hash the user\'s password' })
        }
      } else {
        // User already exists
        callback(400, { Error: 'A user with that email already exists' })
      }
    })
  } else {
    callback(400, { Error: 'Missing required fields' })
  }
}

// Users put
// Required data: email
// Optional data: firstName, lastName, password, street address
handlers._users.put = (data, callback) => {
  // Check for the required filed
  const email = typeof (data.payload.email) === 'string' &&
  data.payload.email.trim().length > 0 ?
    data.payload.email.trim() :
    false;

  // Check for the optional fields
  const firstName = typeof (data.payload.firstName) === 'string' &&
  data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() :
    false;

  const lastName = typeof (data.payload.lastName) === 'string' &&
  data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() :
    false;

  const password = typeof (data.payload.password) === 'string' &&
  data.payload.password.trim().length > 0 ?
    data.payload.password.trim() :
    false;

  const streetAddress = typeof (data.payload.streetAddress) === 'string' &&
  data.payload.streetAddress.trim().length > 0 ?
    data.payload.streetAddress.trim() :
    false;

  // Error if the email is invalid
  if (email) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Get the token from the headers
      const token = typeof (data.headers.token) === 'string' ?
        data.headers.token :
        false

      // Verify that the given token is valid for the email
      _tokens.verifyToken(token, email, tokenValid => {
        if (tokenValid)
          // Lookup the user
          _data.read('users', email, (err, userData) => {
            if (!err && userData) {
              // Update the fields necessary
              if (firstName)
                userData.firstName = firstName

              if (lastName)
                userData.lastName = lastName

              if (password)
                userData.hashedPassword = helpers.hash(password)

              if (streetAddress)
                userData.streetAddress = streetAddress

              // Store the new updates
              _data.update('users', email, userData, err => {
                if (!err)
                  callback(200)
                else
                  callback(500, { Error: 'Could not update the user' })
              })
            } else {
              callback(400, { Error: 'The specified user does not exist' })
            }
          })
        else
          callback(403, { Error: 'Missing required token in header, or token is invalid' })
      })
    } else {
      callback(400, { Error: 'Missing fields to update' })
    }
  } else {
    callback(400, { Error: 'Missing required fields' })
  }
}

// Users delete
//Required field: email
handlers._users.delete = (data, callback) => {
  // check that the email is valid
  const email = typeof (data.payload.email) === 'string' &&
  data.payload.email.trim().length > 0 ?
    data.payload.email.trim() :
    false

  if (email) {
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string' ?
      data.headers.token :
      false

    // Verify that the given token is valid for the email
    _tokens.verifyToken(token, email, tokenValid => {
      if (tokenValid)
        // Lookup the user
        _data.read('users', email, (err, userData) => {
          if (!err && userData)
            // Delete the user
            _data.delete('users', email, err => {
              if (!err)
                // Delete the token from the user deleted
                _tokens.delete(token, callback)
              else
                callback(500, { Error: 'Could not delete the specified user' })
            })
          else
            callback(400, { Error: 'Could not find the specified user' })
        })
      else
        callback(403, { Error: 'Missing required token in header, or token is invalid' })
    })
  } else {
    callback(400, { Error: 'Missing required field' })
  }
}

// Container for the menu sub-methods
handlers._menu = {}

// menu
handlers.menu = (payload, callback) => {
  const acceptableMethods = [ 'get', 'post', 'put', 'delete' ];
  if (acceptableMethods.indexOf(payload.method) > -1)
    handlers._menu[ payload.method ](payload, callback)
  else
    callback(405)
}

// Menu get
// Required data: email
// Optional data: none
handlers._menu.get = (data, callback) => {
  // Check if the email is valid
  const email = typeof (data.queryStringObject.email) === 'string' &&
  data.queryStringObject.email.trim().length > 0 ?
    data.queryStringObject.email.trim() :
    false

  if (email) {
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string' ?
      data.headers.token :
      false

    // Verify that the token belongs to the given email
    handlers._tokens.verifyToken(token, email, tokenValid => {
      if (tokenValid)
        // Read the menu
        _data.read('menu', 'items', (err, menuData) => {
          if (!err && menuData)
            callback(200, menuData)
          else
            callback(400, { Error: 'The menu doesn\'t exist' })
        })
      else
        callback(403, { Error: 'Missing required token in header, or token is invalid' })
    })
  } else {
    callback(400, { Error: 'Missing required fields' })
  }
}

// Container for the cart sub-methods
handlers._carts = {}

// carts
handlers.carts = (payload, callback) => {
  const acceptableMethods = [ 'get', 'post', 'put', 'delete' ];
  if (acceptableMethods.indexOf(payload.method) > -1)
    handlers._carts[ payload.method ](payload, callback)
  else
    callback(405)
}

// Carts get
// Required data: email
// Optional data: none
handlers.carts.get = (data, callback) => {
  // Check if the email is valid
  const email = typeof data.queryStringObject.email === 'string' &&
  data.queryStringObject.email.trim().length > 0 ?
    data.queryStringObject.email.trim() :
    false

  if (email) {
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string' ?
      data.headers.token :
      false

    // Verify that the token belongs to the given email
    handlers._tokens.verifyToken(token, email, tokenValid => {
      if (tokenValid)
        // Read the menu
        _data.read('carts', email, (err, cartData) => {
          if (!err && cartData)
            callback(200, cartData)
          else
            callback(400, { Error: 'The cart doesn\'t exist' })
        })
      else
        callback(403, { Error: 'Missing required token in header, or token is invalid' })
    })
  } else {
    callback(400, { Error: 'Missing required fields' })
  }
}

// Carts post
// Required data: email, item id
// Optional data: none
handlers._carts.post = (data, callback) => {
  // Check if the email is valid
  const email = typeof (data.payload.email) === 'string' &&
  data.payload.email.trim().length > 0 ?
    data.payload.email.trim() :
    false

  // Check if the id of the item is valid
  const itemId = typeof (data.payload.itemId) === 'string' &&
  data.payload.itemId.trim().length > 0 ?
    data.payload.itemId.trim() :
    false

  if (email && itemId) {
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string' ?
      data.headers.token :
      false

    // Verify that the token belongs to the given email
    handlers._tokens.verifyToken(token, email, tokenValid => {
      if (tokenValid)
        // Get the menu items
        _data.read('menu', 'items', (err, menuData) => {
          if (!err && menuData) {
            // Get the item
            const item = menuData.find(item => item.id === itemId)

            // Check if the user has already a cart
            _data.read('carts', email, (err, cartData) => {
              if (!err && cartData) {
                // Add the item to the cart
                cartData.push(item)

                // Update the cart
                _data.update('carts', email, cartData, err => {
                  if (!err)
                    callback(200, item)
                  else
                    callback(500, { Error: 'Could not update the cart with the new item' })
                })
              } else {
                // Create the cart
                let cart = []

                // Add the item to the cart
                cart.push(item)

                // Create the cart file
                _data.create('carts', email, cart, err => {
                  if (!err)
                    callback(200, item)
                  else
                    callback(500, { Error: 'Could not add the item to the cart' })
                })
              }
            })
          } else {
            callback(400, { Error: 'The item doesn\'t exist' })
          }
        })
      else
        callback(403, { Error: 'Missing required token in header, or token is invalid' })
    })
  } else {
    callback(400, { Error: 'Missing required fields' })
  }
}

// Carts items delete
// Required data: email, item id
// Optional data: none
handlers._carts.delete = (data, callback) => {
  // Check if the email is valid
  const email = typeof (data.payload.email) === 'string' &&
  data.payload.email.trim().length > 0 ?
    data.payload.email.trim() :
    false

  // Check if the id of the item is valid
  const itemId = typeof (data.payload.itemId) === 'string' &&
  data.payload.itemId.trim().length > 0 ?
    data.payload.itemId.trim() :
    false

  if (email && itemId) {
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string' ?
      data.headers.token :
      false

    handlers._tokens.verifyToken(token, email, tokenValid => {
      if (tokenValid)
        // Check if the user has cart
        _data.read('carts', email, (err, cartData) => {
          if (!err && cartData) {
            // Check if the item exists in the user's cart
            const item = cartData.find(item => item.id === itemId)

            if (item) {
              // Find the index of the item to remove
              const itemIndex = cartData.indexOf(item)

              // Remove the item from the cart
              cartData.splice(itemIndex, 1)

              // Update the user's cart
              _data.update('carts', email, cartData, err => {
                if (!err)
                  callback(200, item)
                else
                  callback(500, { Error: 'Could not delete the item' })
              })
            } else {
              callback(400, { Error: 'The user doesn\'t have the item in his cart yet' })
            }
          } else {
            callback(400, { Error: 'The user doesn\'t have a shopping cart yet' })
          }
        })
      else
        callback(403, { Error: 'Missing required token in header, or token is invalid' })
    })
  } else {
    callback(400, { Error: 'Missing required fields' })
  }
}

// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = [ 'post', 'get', 'put', 'delete' ];
  if (acceptableMethods.indexOf(data.method) > -1)
    handlers._tokens[ data.method ](data, callback);
  else
    callback(405)
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
  // Check that the id is valid
  const id = typeof data.queryStringObject.id === 'string' &&
  data.queryStringObject.id.trim().length === 20 ?
    data.queryStringObject.id.trim() :
    false;

  if (id) {
    // Lookup the user
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { Error: 'Missing required field' })
  }
};

// Tokens post
// Required data: email, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const email = typeof data.payload.email === 'string' &&
  data.payload.email.trim().length > 0 ?
    data.payload.email.trim() :
    false;

  const password = typeof (data.payload.password) === 'string' &&
  data.payload.password.trim().length > 0 ?
    data.payload.password.trim() :
    false;

  if (email && password) {
    // Lookup the user who matches that email number
    _data.read('users', email, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password, and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // If valid, create a new token with a random name. Set expiration date one hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            email,
            id: tokenId,
            expires
          };

          // Store the token
          _data.create('tokens', tokenId, tokenObject, err => {
            if (!err)
              callback(200, tokenObject);
            else
              callback(500, { Error: 'Could not create the new token' })
          })
        } else {
          callback(400, { Error: 'Password did not match the specified user\'s stored password' })
        }
      } else {
        callback(400, { Error: 'Could not find the specified user' })
      }
    })
  } else {
    callback(400, { Error: 'Missing required fields' })
  }
};

// Tokens put
// Required fields: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const id = typeof (data.payload.id) === 'string' &&
  data.payload.id.trim().length === 20 ?
    data.payload.id.trim() :
    false;

  const extend = typeof (data.payload.extend) === 'boolean' &&
    data.payload.extend === true;

  if (id && extend) {
    // Lookup th token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store new updates
          _data.update('tokens', id, tokenData, err => {
            if (!err) {
              callback(200)
            } else {
              callback(500, { Error: 'Could not update the token\'s expiration' })
            }
          })
        } else {
          callback(400, { Error: 'The token has already expired, and cannot be extended' })
        }
      } else {
        callback(400, { Error: 'Specified token does not exist' })
      }
    })
  } else {
    callback(400, { Error: 'Missing required field(s) or filed(s) are invalid' })
  }
};

// Tokens delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // Check that the id is valid
  const id = typeof (data.queryStringObject.id) === 'string' &&
  data.queryStringObject.id.trim().length === 20 ?
    data.queryStringObject.id.trim() :
    false;

  if (id) {
    // Lookup the token
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        _data.delete('tokens', id, err => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { Error: 'Could not delete the specified token' })
          }
        });
      } else {
        callback(400, { Error: 'Could not find the specified token' })
      }
    })
  } else {
    callback(400, { Error: 'Missing required field' })
  }
};

// Verify if a given id is currently valid for a given user
handlers._tokens.verifyToken = (id, email, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, data) => {
    if (!err && data) {
      // Check that the token is for the given user and has not expired
      if (data.email === email && data.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
};


// Tokens
handlers.order = (data, callback) => {
  const acceptableMethods = [ 'post', 'get', 'put', 'delete' ];
  if (acceptableMethods.indexOf(data.method) > -1)
    handlers._order[ data.method ](data, callback);
  else
    callback(405)
};

// Container for all the tokens methods
handlers._order = {};

// Create order
// Required data: email
// Optional data: none
handlers._order.post = (data, callback) => {
  // Check that the email is valid
  const email = typeof data.payload.email === 'string' &&
  data.payload.email.trim().length > 0 ?
    data.payload.email.trim() :
    false

  if (email) {
    // Get the token from the headers
    const token = typeof data.headers.token === 'string' ?
      data.headers.token :
      false

    handlers._tokens.verifyToken(token, email, tokenValid => {
      if (tokenValid)
        // Check if the user has a cart
        _data.read('carts', email, (err, cartData) => {
            if (!err && cartData) {
              // Get the total amount of the cart
              const amount = helpers.totalAmount(cartData)

              // Create the order
              helpers.createOrder(amount, email, (status, orderData) => {
                if (status === 200 || status === 201)
                  // Send the success email to the customer
                  helpers.mail(email, 'Incoming payment', 'Payment received successfully', err => {
                    if (!err)
                      callback(200, orderData)
                    else
                      callback(400, { Error: err })
                  })
                else
                  callback(status, { Error: orderData.error.message })
              })
            } else {
              callback(400, { Error: 'The user doesn\'t have a cart' })
            }
          }
        )
      else
        callback(403, { Error: 'Missing required token in header, or token is invalid' })
    })
  } else {
    callback(400, { Error: 'Missing required fields' })
  }
}

handlers.notFound = (data, callback) => callback(404)

// Export the module
module.exports = handlers