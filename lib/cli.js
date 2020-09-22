/*
 * CLI-Related Tasks
 *
 */

// Dependencies
const readline = require('readline')
const util = require('util')
const events = require('events')

util.debuglog('cli');

class _events extends events {
}

const e = new _events()

const helpers = require('./helpers')
const _data = require('./data')

// Instantiate the CLI module object
const cli = {}

// Input handlers
e.on('man', () => cli.responders.help())
e.on('help', () => cli.responders.help())
e.on('exit', () => cli.responders.exit())
e.on('menu', () => cli.responders.menu())
e.on('orders', () => cli.responders.orders())
e.on('more order info', str => cli.responders.moreOrderInfo(str))
e.on('list users', () => cli.responders.users())
e.on('more user info', str => cli.responders.moreUserInfo(str))

// Responders object
cli.responders = {}

// Help / Man
cli.responders.help = () => {
  const commands = {
    'exit': 'Kill the CLI (and the rest of the application)',
    'man': 'Show this help page',
    'help': 'Alias of "man" command',
    'menu': 'View all the current menu items',
    'orders': 'View all the recent orders in the system (orders placed in the last 24 hours)',
    'more order info --{orderId}': 'Lookup the details of a specific order by order ID',
    'list users': 'View all the users who have signed up in the last 24 hours',
    'more user info --{email}': 'Lookup the details of a specific user by email address'
  }

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine()
  cli.centered('CLI MANUAL')
  cli.horizontalLine()
  cli.verticalSpace(2)

  // Show each command, followed by its explanation, in white and yellow respectively
  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      const value = commands[ key ]
      let line = `\x1b[33m${key}\x1b[0m`
      const padding = 60 - line.length

      for (let i = 0; i < padding; i++)
        line += ' '

      line += value
      console.log(line)
      cli.verticalSpace()
    }
  }

  cli.verticalSpace()

  // End with another horizontal line
  cli.horizontalLine()
}

// Create a vertical space
cli.verticalSpace = lines => {
  lines = typeof lines === 'number' && lines > 0 ? lines : 1
  for (let i = 0; i < lines; i++)
    console.log('')
}

// Create a horizontal line across the screen
cli.horizontalLine = () => {
  // Get the available screen size
  const screenWith = process.stdout.columns
  let line = ''

  for (let i = 0; i < screenWith; i++)
    line += '-'

  console.log(line)
}

// Create centered text of the screen
cli.centered = str => {
  str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : ''

  // Get the available screen size
  const screenWith = process.stdout.columns

  // Calculate the left padding there should be
  const leftPadding = Math.floor(screenWith - str.length) / 2

  // Put in left padded spaces before the string itself
  let line = ''
  for (let i = 0; i < leftPadding; i++)
    line += ' '

  line += str
  console.log(line)
}

// Exit
cli.responders.exit = () => process.exit(0)

// Menu
cli.responders.menu = () => _data.read('menu', 'items', (err, menuData) => {
  if (!err && menuData) {
    cli.verticalSpace()
    menuData.forEach(order => console.log(order))
  }
})

// Orders
cli.responders.orders = () => _data.list('carts', (ordersError, ordersData) => {
  if (!ordersError && ordersData) {
    cli.verticalSpace()

    ordersData.forEach(order => console.log(order))

    cli.verticalSpace()
  }
})

cli.responders.moreOrderInfo = str => {
  // Get the order from the string
  const arr = str.split('--')
  const order = typeof arr[ 1 ] === 'string' &&
  arr[ 1 ].trim().length > 0 ?
    arr[ 1 ].trim() :
    false

  if (order) {
    _data.read('carts', order, (orderError, orderData) => {
      if (!orderError && orderData) {
        // Array to contain the resume
        let resume = []

        // Evaluate each item
        orderData.forEach(item => {
          // Check if the array already has the item
          const itemResume = resume.find(element => element.id === item.id)

          if (itemResume) {
            // Update the item in the resume
            itemResume.quantity += 1
            itemResume.total += item.price
          } else {
            // Push the new item to the resume array
            let obj = {}

            obj.id = item.id
            obj.name = item.name
            obj.quantity = 1
            obj.total = item.price

            resume.push(obj)
          }
        })

        const totalQuantity = resume.reduce((acc, cur) => acc + cur.quantity, 0)
        const totalValue = resume.reduce((acc, cur) => acc + cur.total, 0)

        cli.verticalSpace()

        // Display the resume
        console.table(resume)
        console.dir(`Total quantity: ${totalQuantity} - Total amount: $ ${totalValue}`)

        cli.verticalSpace()
      }
    })
  }
}

// Users
cli.responders.users = () => _data.list('users', (usersError, usersData) => {
  if (!usersError && usersData) {
    cli.verticalSpace()

    usersData.forEach(order => console.log(order))

    cli.verticalSpace()
  }
})

// Orders
cli.responders.orders = () => _data.list('carts', (ordersError, ordersData) => {
  if (!ordersError && ordersData) {
    cli.verticalSpace()

    ordersData.forEach(order => console.log(order))

    cli.verticalSpace()
  }
})

// More user info
cli.responders.moreUserInfo = str => {
  // Get the order from the string
  const arr = str.split('--')
  const user = typeof arr[ 1 ] === 'string' &&
  arr[ 1 ].trim().length > 0 ?
    arr[ 1 ].trim() :
    false

  if (user) {
    _data.read('users', user, (userError, userData) => {
      if (!userError && userData) {
        delete userData.hashedPassword

        cli.verticalSpace()
        console.dir(userData, {colors: true})
        cli.verticalSpace()
      }
    })
  }
}

// Input processor
cli.processInput = str => {
  str = typeof str === 'string' &&
  str.trim().length > 0 ?
    str.trim() :
    false

  // Only process the input if the user actually wrote something. Otherwise ignore it
  if (str) {
    // Codify the unique strings that identify the unique questions allowed to be asked
    const uniqueInputs = [
      'man',
      'help',
      'exit',
      'menu',
      'orders',
      'more order info',
      'list users',
      'more user info'
    ]

    // Go through the possible inputs, exit an event when a match is found
    let matchFound = false

    uniqueInputs.some(input => {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true

        // Emit an event matching the unique input, and include the full string given
        e.emit(input, str)

        return true
      }
    })

    if (!matchFound)
      console.log('Sorry, try again')
  }
}

// Init script
cli.init = () => {
  // Send the start message to the console, in dark blue
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is running')

  // Start the interface
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  })

  // Create an initial prompt
  _interface.prompt()

  // Handle each line of input separately
  _interface.on('line', str => {
    // Send to the input processor
    cli.processInput(str)

    // Re-initialize the prompt afterwards
    _interface.prompt()
  })

  // If the user stops the CLI, kill the associated process
  _interface.on('close', () => process.exit(0))
}

module.exports = cli