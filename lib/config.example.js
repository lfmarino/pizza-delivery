/*
 * Create and exports configuration variables
 *
 */

// Container for all the environments
let Environments = {}

// Staging (default) environment
Environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsASecret',
  stripe: {
    public:'',
    secret:''
  },
  mailgun: {
    base_url: '',
    protocol: '',
    path: '',
    api_key: '',
    domain: '',
  },
  templateGlobals: {
    appName: 'pizza-delivery',
    companyName: 'Pizza Delivery, Inc',
    yearCreated: '2020',
    baseUrl: 'http://localhost:3000/'
  }
}

// Production environment
Environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsAProductionSecret',
  stripe: {},
  mailgun: {},
  templateGlobals: {
    appName: '',
    companyName: '',
    yearCreated: '',
    baseUrl: 'http://localhost:5000/'
  }
}

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ?
  process.env.NODE_ENV.toLowerCase() :
  ''

// Check that the current environment above, if not, default to staging
const environmentToExport = typeof Environments[currentEnvironment] === 'object' ?
  Environments[currentEnvironment] :
  Environments.staging

// Export the module
module.exports = environmentToExport