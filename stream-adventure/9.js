import http from "node:http";
import { Transform } from 'node:stream'

const uppercaseTransform = new Transform({
  transform(chunk, econding, cb) {
    const uppercased = chunk.toString().toUpperCase();
    return cb(null, uppercased);
  }
})

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    req.pipe(uppercaseTransform).pipe(res);
  }
})
server.listen(process.argv[2])