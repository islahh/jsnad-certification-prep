// my solution
import { Readable } from 'node:stream'

const rd = new Readable();
rd.push(process.argv[2])
rd.pipe(process.stdout);


// oficial solution
// const { Readable } = require('stream')
// class ReadableStream extends Readable {
//   _read(size) {
//   }
// }
// const stream = new ReadableStream()
// stream.push(process.argv[2])
// stream.pipe(process.stdout)