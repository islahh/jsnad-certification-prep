// I've asked these exercises to gpt and answered only the importants for JSNAD exam at this file

// 1.1 Write a command to run app.js with the environment variable MODE=production.
// console.log('process.env.MODE', process.env.MODE)
// run it with: MODE="test" node app.js

// 1.2: Use the Node.js REPL to evaluate the expression 5 + 6 * 3.
// node -e "5 + 6 * 3" or node -p "5 + 6 * 3"

// 2.1 Create a Buffer containing the string "Hello, Node" and log its hexadecimal representation.
// console.log(Buffer.from("Hello, node").toString('hex'))

// 2.2 Allocate a 10-byte buffer and fill it with the value 0xff.
// console.log('Buffer.alloc(10, 0xff)', Buffer.alloc(10, 0xff))

// 3.1 Create a readable stream from a file called input.txt and pipe it to a writable stream output.txt.
// const { createReadStream, createWriteStream } = require('fs')

// const rd = createReadStream('input.txt')
// const wt = createWriteStream('output.txt')
// rd.pipe(wt);

// 3.2 Implement a Transform stream that converts all incoming data to uppercase.
// const { Transform } = require('stream')
// const uppercaseTransform = new Transform({
//   transform(chunk, enc, cb) {
//     const uppercased = chunk.toString().toUpperCase()
//     cb(null, uppercased)
//   }
// })

// const { createReadStream, createWriteStream } = require('fs')

// const rd = createReadStream('input.txt')
// const wt = createWriteStream('output.txt')
// rd.pipe(uppercaseTransform).pipe(wt);

// 4.1 Create an EventEmitter that emits an event called "start" with a payload.
// const EventEmitter = require('events')
// const myev = new EventEmitter();

// myev.on('start', (payload) => {
//   console.log('payload', payload)
// })

// myev.emit('start', { test: true })

// 4.2 Listen for an "error" event and log the error message.
// const EventEmitter = require('events')
// const myev = new EventEmitter();

// myev.on('error', (err) => {
//   console.error('here on err', err)
// })

// myev.on('start', () => {
//   try {
//     throw new Error('testing')
//   }
//   catch (err) {
//     myev.emit('error', err)
//   }
// })

// myev.emit('start');

// 6.1 Use spawn to run the ls command and log the output.
// const { spawn } = require('child_process')
// const ls = spawn('ls', [])

// let output = ''
// ls.stdout.on('data', (data) => {
//   output += data.toString();
// });

// ls.stdout.on('end', () => {
//   console.log(output)
// })
// or
// ls.stdout.pipe(process.stdout)
// or simply pass this options to spawn command as third argument: { stdio: ['ignore', 'inherit', 'ignore']}

// 6.2 Use exec to run node -v and log the result.
// const { exec } = require('child_process')
// exec('node -v', (err, data) => {
//   console.log('data', data)
// })
// or
// const res = exec('node -v');
// res.stdout.pipe(process.stdout)

// 7.1 Write a file named greeting.txt with the content "Hello, File System!".
// const fs = require('fs')
// const path = require('path')
// fs.writeFileSync(path.resolve(__dirname,'greeting.txt'), 'Hello, File System!');

// 7.2 Read the contents of greeting.txt asynchronously and log it.
// const fs = require('fs')
// const path = require('path')
// fs.writeFile(path.resolve(__dirname, 'greeting.txt'), 'Hello, File System!', (err) => {
//   if (err) {
//     console.error('Error', err);
//   } else {
//     console.log('OK');
//   }
// });

// 7.3 Check if the file greeting.txt exists.
// const fs = require('fs')
// const path = require('path')
// const res = fs.existsSync(path.resolve(__dirname, 'greeting.txt'))
// if (res === true) {
//   console.log('file exists')
// } else {
//   console.log('file does not exists')
// }

// 8.1 Export a function from math.js and import it into index.js using CommonJS.
// math.js
// module.exports = function sum(a, b) {
//   return a + b
// }

// this file
// const sum = require('./math.js')
// const res = sum(1, 2)
// console.log('res', res)

// 8.2 Create an ES Module that exports a default class Car and import it.
// first enable type: "module" on package.json
// car.js
// export default class Car {
//   constructor(model) {
//     this.model = model
//   }
// }
// this file
// import Car from './car.js'
// const mycar = new Car('testing')
// console.log('mycar', mycar)

// 10.1 Log all environment variables using Node.js.
// console.log('process.env', process.env)

// 10.2 Exit the process with status code 1 if a required environment variable API_KEY is missing.
// To exit with error run: node app.js
// To exit WITHOUT error run: API_KEY="test" node app.js
// if (!process.env.API_KEY) {
//   console.log('missing env variable')
//   process.exit(1)
// } else {
//   console.log('ok')
// }

// 12.1 Handle an uncaught exception and log a custom error message.
// process.on('uncaughtException', (err, origin) => {
//   console.log('err', err)
//   console.log('origin', origin)
//   console.log('Custom message - error message:', err.message)
// })
// throw new Error('test');

// 12.2 Create a Promise that rejects and properly handle the rejection.
// new Promise((res, rej) => rej(new Error('myerror test')))
//   .catch(err => {
//     console.log('err', err)
//   })