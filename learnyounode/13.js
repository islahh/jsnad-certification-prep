const http = require('http')
const url = require('url')

const PORT = process.argv[2]

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })

  if (req.method === 'GET') {
    const parsedUrl = url.parse(req.url, true)
    const pathname = parsedUrl.pathname
    const query = parsedUrl.query

    if (pathname === '/api/parsetime' && query.iso) {
      const datetimeString = query.iso
      const date = new Date(datetimeString)

      res.end(JSON.stringify({
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds()
      }))
    } else if (pathname === '/api/unixtime' && query.iso) {
      const datetimeString = query.iso
      const date = new Date(datetimeString)

      res.end(JSON.stringify({
        unixtime: date.getTime()
      }))
    }
  }
})

server.listen(PORT)
