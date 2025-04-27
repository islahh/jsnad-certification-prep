const mymodule = require('./6-1.js')

const DIRECTORY_NAME = process.argv[2];
const FILE_EXTENSION_TO_FILTER = process.argv[3];
mymodule(DIRECTORY_NAME, FILE_EXTENSION_TO_FILTER, (err, data) => {
  if (err) {
    console.error(err)
  }
  console.log(data.join('\n'))

})