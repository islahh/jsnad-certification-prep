const fs = require('fs')

const DIRECTORY_NAME = process.argv[2];
const FILE_EXTENSION_TO_FILTER = process.argv[3];

fs.readdir(DIRECTORY_NAME, (err, files) => {
  const filesArray = files.toString().split(',');

  const filteredFiles = filesArray.filter(file => file.includes('.' + FILE_EXTENSION_TO_FILTER))
  console.log(filteredFiles.join('\n'))
})