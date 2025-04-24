// my solution --> I prefered to use only native modules
import { Transform } from 'node:stream'

const uppercaseTransform = new Transform({
  transform(chunk, encoding, cb) {
    return cb(null, chunk.toString().toUpperCase())
  }
})

process.stdin.pipe(uppercaseTransform).pipe(process.stdout)

// oficial solution
// const through = require('through2')

// const tr = through(function (buf, _, next) {
//   this.push(buf.toString().toUpperCase())
//   next()
// })
// process.stdin.pipe(tr).pipe(process.stdout)