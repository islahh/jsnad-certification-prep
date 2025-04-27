import http from "node:http";


// req is a writable
// res is a readable
const req = http.request("http://localhost:8099", { method: "POST" }, (res) => {
  res.pipe(process.stdout);
})

process.stdin.pipe(req); // sending (readable stream STDIN) to (writable stream REQ)
