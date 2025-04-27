const http = require('http')
const { Transform } = require('stream')

const PORT = process.argv[2]

const transformUppercased = new Transform({
  transform(chunk, enc, cb) {
    this.push(chunk.toString().toUpperCase())
    cb(null)
  }
})

const server = http.createServer((req, res) => {

  let data = ''
  if (req.method === 'POST') {
    // solution 1
    req.pipe(transformUppercased).pipe(res)

    // solution 2
    // req.on('data', (chunk) => data += chunk.toString())
    // req.on('end', () => {
    //   res.end(data.toUpperCase())
    // })
  }
})

server.listen(PORT);