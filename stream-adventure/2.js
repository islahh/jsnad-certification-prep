// process.argv[2] file
// Use fs.createReadStream() to pipe the given file to process.stdout.

import fs from 'node:fs'

const myReadable = fs.createReadStream(process.argv[2])

myReadable.pipe(process.stdout)
// 

