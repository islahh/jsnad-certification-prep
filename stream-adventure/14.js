const { Duplex } = require('stream')

// remove type module on package.json (stream-adventure issue)
module.exports = function (counter) {
  const counts = {}
  const stream = new Duplex({
    objectMode: true,
    writableObjectMode: true,  // Explicitly specify that the stream will handle object mode

    write(chunk, enc, cb) {
      counts[chunk.country] = (counts[chunk.country] || 0) + 1;
      cb(null)
    },
    read(size) {
      // Pass through data from the counter to the readable side of the stream
      let data;
      while (null !== (data = counter.read(size))) {
        this.push(data);
      }
    }
  })

  stream.on('finish', () => {
    console.log('counts', counts)
    counter.setCounts(counts)
  })

  return stream
}


// oficial solution
// const duplexer = require('duplexer2')
// const through = require('through2').obj

// module.exports = function (counter) {
//   const counts = {}
//   const input = through(write, end)
//   return duplexer({ objectMode: true }, input, counter)

//   function write (row, _, next) {
//     counts[row.country] = (counts[row.country] || 0) + 1
//     next()
//   }
//   function end (done) {
//     counter.setCounts(counts)
//     done()
//   }
// }
