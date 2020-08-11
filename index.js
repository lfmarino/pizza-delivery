/*
 *Primary file for the API
 *
 */

// Dependencies
const Server = require('./lib/server')

// Declare the app
const App = {}

// init function
App.init = () => {
  // Start the server
  Server.init()
}

// Execute
App.init()

// Export the App
module.exports = App;
