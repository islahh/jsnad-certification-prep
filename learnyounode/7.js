const http = require('http')

const URL = process.argv[2]

const request = http.request(URL, { method: "GET" }, (response) => {
  response.on('data', (chunk) => {
    console.log(chunk.toString())
  })
})
request.end()