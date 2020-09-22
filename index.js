/*
 *Primary file for the API
 *
 */

// Dependencies
const Server = require('./lib/server')
const cli = require('./lib/cli')

// Declare the app
const App = {}

// init function
App.init = () => {
  // Start the server
  Server.init()

  // Start the cli, but make sure it starts last
  setTimeout(() => cli.init(), 50)
}

// Execute
App.init()

// Export the App
module.exports = App;
