const http = require('http')

const URL = process.argv[2]

const request = http.request(URL, { method: "GET" }, (response) => {
  let data = '';
  response.on('data', (chunk) => {
    data += chunk.toString();
  })

  response.on('end', () => {
    console.log(data.length)
    console.log(data)
  })
})
request.end()