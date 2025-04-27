const http = require('http')

const URL1 = process.argv[2]
const URL2 = process.argv[3]
const URL3 = process.argv[4]

function doTask(url) {
  return new Promise((resolve, reject) => {
    const request = http.request(url, { method: "GET" }, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk.toString();
      })

      response.on('end', () => {
        resolve(data)
      })
    })
    request.end()
  })
}

(async () => {
  const url1Response = await doTask(URL1)
  console.log(url1Response)
  const url2Response = await doTask(URL2)
  console.log(url2Response)
  const url3Response = await doTask(URL3)
  console.log(url3Response)
})()