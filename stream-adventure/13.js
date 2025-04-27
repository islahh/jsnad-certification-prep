// remove type module on package.json (stream-adventure issue)
const { spawn } = require("child_process");
const { Duplex } = require("stream");

module.exports = function (cmd, args) {
  const child = spawn(cmd, args);

  const stream = new Duplex({
    write(chunk, encoding, callback) {
      child.stdin.write(chunk, encoding, callback);
    },

    read(size) { },
  });

  child.stdout.on("data", (chunk) => {
    // if (!stream.push(Buffer.from('dale'))) { // here I'm streaming data to whoever wants to read it from my stream
    if (!stream.push(chunk)) { // here I'm streaming data to whoever wants to read it from my stream
      child.stdout.pause();
    }
  });

  child.stdout.on("end", () => { // if child.stdout ends our stream ends too
    stream.end();
  });

  // Ensure stdin is closed when the duplex stream ends
  // if we end it before we couldn't write in the write method of our duplex stream
  stream.on("finish", () => { // if our stream end we can end stdin too
    child.stdin.end();
  });

  return stream;
};

//oficial solution with libs
// const { spawn } = require('child_process')
// const duplexer = require('duplexer2')

// module.exports = function (cmd, args) {
//   const ps = spawn(cmd, args)
//   return duplexer(ps.stdin, ps.stdout)
// }
