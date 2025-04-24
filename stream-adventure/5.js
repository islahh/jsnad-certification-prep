// my solution
import { Writable } from 'node:stream'

const ws = new Writable({
  write(chunk, econding, callback) {
    // process.stdout
    console.log(`writing: ${chunk.toString()}`)
    return callback(null)
  }
})

process.stdin.pipe(ws)

// oficial solution
// const { Writable } = require('stream')

// class MyWritable extends Writable {
//   _write(chunk, encoding, callback) {
//     console.log(`writing: ${chunk.toString()}`)
//     callback()
//   }
// }

// const stream = new MyWritable()
// process.stdin.pipe(stream)