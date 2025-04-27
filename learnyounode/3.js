const fs = require('fs')

const res = fs.readFileSync(process.argv[2])
console.log(res.toString().split('\n').length - 1)
