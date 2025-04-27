const fs = require('fs')

module.exports = function (DIRECTORY_NAME, FILE_EXTENSION_TO_FILTER, callback) {
  fs.readdir(DIRECTORY_NAME, (err, files) => {
    if (err) {
      return callback(err, null)
    }
    const filesArray = files.toString().split(',');

    const filteredFiles = filesArray.filter(file => file.includes('.' + FILE_EXTENSION_TO_FILTER))
    return callback(null, filteredFiles)
  })
}