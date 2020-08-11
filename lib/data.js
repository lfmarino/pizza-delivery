/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs = require('fs')
const path = require('path')

const helpers = require('./helpers')

// Container for the module
const data = {}

// Base directory of the data folder
data.baseDir = path.join(__dirname, '/../.data/')

// Write data to a file
data.create = (dir, file, payload, callback) => {
  // Open the file for writing
  fs.open(`${data.baseDir}${dir}/${file}.json`, 'wx', (err, fd) => {
    if (!err && fd) {
      // Convert data to string
      const stringData = JSON.stringify(payload)

      // Write to file and close it
      fs.writeFile(fd, stringData, err1 => {
        if (!err1)
          fs.close(fd, err2 => {
            if (!err2) callback(false)
            else callback('Error closing new file')
          })
        else
          callback('Error writing to new file')
      })
    } else {
      callback('Could not create a new file, it may already exist')
    }
  })
}

// Read data from a file
data.read = (dir, file, callback) => {
  fs.readFile(`${data.baseDir}${dir}/${file}.json`, 'utf8', (err, payload) => {
    if (!err && payload) {
      const parsedData = helpers.parseJsonToObject(payload)

      callback(false, parsedData)
    } else {
      callback(err, payload)
    }
  })
}

// Update data inside a file
data.update = (dir, file, payload, callback) => {
  // Open the file for writing
  fs.open(`${data.baseDir}${dir}/${file}.json`, 'r+', (err, fd) => {
    if (!err && fd) {
      // Convert data to string
      const stringData = JSON.stringify(payload)

      // Truncate the file
      fs.ftruncate(fd, err1 => {
        if (!err1)
          // Write the file and close it
          fs.writeFile(fd, stringData, err2 => {
            if (!err2)
              fs.close(fd, err3 => {
                if (!err3) callback(false)
                else callback('Error closing the file')
              })
            else
              callback('Error writing to existing file')
          })
        else
          callback('Error truncating file')
      })
    } else {
      callback('Could not open the file for updating, it may not exist yet')
    }
  })
}

// Delete a file
data.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(`${data.baseDir}${dir}/${file}.json`, err => {
    if (!err)
      callback(false)
    else
      callback('Error deleting file')
  })
}

// List all the items in a directory
data.list = (dir, callback) => {
  fs.readdir(`${data.baseDir}${dir}/`, (err, files) => {
    if (!err && files && files.length > 0) {
      let trimmedFileNames = [];

      files.forEach(file => trimmedFileNames.push(file.replace('.json', '')))

      callback(false, trimmedFileNames)
    } else {
      callback(err, files)
    }
  })
}

// Export the module
module.exports = data