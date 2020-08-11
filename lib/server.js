/*
 * server-related tasks
 *
 */

// Dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const util = require('util')
const debug = util.debuglog('server')

const config = require('./config')
const helpers = require('./helpers')
const handlers = require('./handlers')

// Instantiate the server module object
const server = {}

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res)
})

// All the server logic for both the http and https servers
server.unifiedServer = (req, res) => {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  const queryStringObject = parsedUrl.query

  // Get the HTTP method
  const method = req.method.toLowerCase()

  // Get the headers as an object
  const headers = req.headers

  // Get the payload if any
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', data => buffer += decoder.write(data))
  req.on('end', () => {
    buffer += decoder.end();

    // Choose the handler this request should go to, if one is not found use the not found handler
    let chosenHandler = typeof server.router[ trimmedPath ] !== 'undefined' ?
      server.router[ trimmedPath ] :
      handlers.notFound

    // If the request is within the public directory, use the public handler instead
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, (status, payload, contentType) => {
      // Determine the type of response (fallback to JSON)
      contentType = typeof contentType === 'string' ? contentType : 'json';

      //Use the status code called back by the handler, or default to 200
      status = typeof status === 'number' ? status : 200;

      //Return the response parts that are content-specific
      let payloadString = ''

      if (contentType === 'json') {
        res.setHeader('Content-Type', 'application/json')

        //Use the payload called  by the handler or default to an empty object
        payload = typeof payload === 'object' ? payload : {}

        // Convert the payload to a string
        payloadString = JSON.stringify(payload)
      }

      if (contentType === 'html') {
        res.setHeader('Content-Type', 'text/html')

        //Use the payload called  by the handler or default to an empty string
        payloadString = typeof payload === 'string' ? payload : ''
      }

      if (contentType === 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');

        //Use the payload called  by the handler or default to an empty string
        payloadString = typeof payload !== 'undefined' ? payload : '';
      }

      if (contentType === 'css') {
        res.setHeader('Content-Type', 'text/css');

        //Use the payload called  by the handler or default to an empty string
        payloadString = typeof payload !== 'undefined' ? payload : '';
      }

      if (contentType === 'png') {
        res.setHeader('Content-Type', 'image/png');

        //Use the payload called  by the handler or default to an empty string
        payloadString = typeof payload !== 'undefined' ? payload : '';
      }

      if (contentType === 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');

        //Use the payload called  by the handler or default to an empty string
        payloadString = typeof payload !== 'undefined' ? payload : '';
      }

      if (contentType === 'plain') {
        res.setHeader('Content-Type', 'text/plain');

        //Use the payload called  by the handler or default to an empty string
        payloadString = typeof payload !== 'undefined' ? payload : '';
      }

      // Return the response
      res.writeHead(status)
      res.end(payloadString)

      // If the response is 200, print green, otherwise print red
      if (status === 200)
        debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${status}`);
      else
        debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${status}`);
    })
  })
}

// Define a request router
server.router = {
  '': handlers.index,
  'account/create': handlers.accountCreate,
  'session/create': handlers.sessionCreate,
  'session/deleted': handlers.sessionDeleted,
  'dashboard': handlers.dashboard,
  'api/users': handlers.users,
  'api/menu': handlers.menu,
  'api/carts': handlers.carts,
  'api/order': handlers.order,
  'api/tokens': handlers.tokens,
  'favicon.ico': handlers.favicon,
  'public': handlers.public
}

// Init script
server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(
    config.httpPort,
    () => console.log('\x1b[36m%s\x1b[0m', `The server is listening on port ${config.httpPort}`)
  )
}

// Export server module
module.exports = server