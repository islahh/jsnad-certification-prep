// my solution --> I prefered to use only native modules
// process.stdin will receive text --> move chunk.toString() --> reverse string --> send to process.stdout
// use a transform for it
import { Transform } from 'node:stream'

let completeString = ''
const reverseTransform = new Transform({
  transform(chunk, encoding, cb) {
    const string = chunk.toString();
    completeString += string
    return cb()
    // return cb(null, reversed) // if we do it, cb will do automatically a this.push(data)
    // and the code will goes to the pipe (sending to process.stdout)
  },
  flush(cb) {
    const reversed = completeString.split('').reverse().join('');
    this.push(reversed); // this is the way we send data for next stream pipe
    // as we just want the reversed string in the end, we need to push on flush()
    // flush runs once in the end of transform stream
    return cb()
  }
})

process.stdin.pipe(reverseTransform).pipe(process.stdout)


// oficial solution
// const concat = require('concat-stream')

// process.stdin.pipe(concat(function (src) {
//   const s = src.toString().split('').reverse().join('')
//   process.stdout.write(s)
// }))