// my solution --> I prefered to use only native modules
import { Transform } from 'node:stream'

class CustomLineTransform extends Transform {
  constructor(props) {
    super(props)
    this.isOdd = true // first line = odd
  }

  _transform(chunk, econding, cb) {
    const line = chunk.toString();
    const transformedLine = this.isOdd ? line.toLowerCase() : line.toUpperCase();
    this.isOdd = !this.isOdd;
    return cb(null, transformedLine);
  }
}

const customLineTransform = new CustomLineTransform();
process.stdin.pipe(customLineTransform).pipe(process.stdout)

// oficial solution
// const through = require('through2')
// const split2 = require('split2')

// let lineCount = 0
// const tr = through(function (buf, _, next) {
//   const line = buf.toString()
//   this.push(lineCount % 2 === 0
//     ? line.toLowerCase() + '\n'
//     : line.toUpperCase() + '\n'
//   )
//   lineCount++
//   next()
// })
// process.stdin
//   .pipe(split2())
//   .pipe(tr)
//   .pipe(process.stdout)