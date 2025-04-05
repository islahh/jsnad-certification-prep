https://nodejs.org/dist/latest-v22.x/docs/api/stream.html

# Streams

- Streams efficiently process large data volumes by handling data incrementally in small chunks, avoiding high memory usage. They are ideal for scenarios like large file handling and real-time data processing - this way we don't need exorbitant compute resources.
  We will cover the different types of streams, how to create and manage them, and best practices for building efficient, safe data pipelines.
- All streams are instances of EventEmitter - it is important since we work with event listeners on streams. Example:

  ```javascript
  const fs = require("fs");
  const readableStream = fs.createReadStream("file.txt");
  readableStream.on("data", (chunk) => {
    console.log("Received chunk:", chunk);
  });

  readableStream.on("end", () => {
    console.log("Stream ended");
  });

  readableStream.on("error", (err) => {
    console.error("Error occurred:", err);
  });
  ```

## Stream Basics & Types

- The only method the stream implements is the `pipe` - others are inherithed from the EventEmitter.
  - `node -p "stream.prototype"` // EventEmitter { pipe: [Function (anonymous)], eventNames: [Function: eventNames] }
  # Node.js Stream Types and Events

## Types

- `Stream`: The base class for all streams in Node.js. It is abstract and not intended to be used directly, but serves as the foundation for other stream types.
- `Readable`: A stream that allows reading data from a source. It implements the `read()` method to pull data from the stream.
- `Writable`: A stream that allows writing data to a destination. It implements the `write()` method to push data into the stream.
- `Duplex`: A stream that is both `Readable` and `Writable`. It allows for both reading and writing operations.
- `Transform`: A type of `Duplex` stream that modifies or transforms the data as it is read and written. It provides the `transform()` method to alter data.
- `PassThrough`: A type of `Transform` stream that passes data through without modifying it. It is useful for logging or monitoring.

## Main Stream Events Emitted by Application-Level Code

- `data`: Emitted when there is data available to be read from a `Readable` stream. The event provides the chunk of data that has been read.
- `end`: Emitted by a `Readable` stream when there is no more data to be read. It signals the end of the stream.
- `finish`: Emitted by a `Writable` stream when all data has been flushed to the underlying system and the stream has been closed. It signals that writing has completed.
- `close`: Emitted when a stream and its underlying resources are fully closed, signaling that it is safe to discard or clean up the stream.
- `error`: Emitted when an error occurs during a stream operation. This event provides an `Error` object describing the issue.

## Stream Modes

- **Stream mode** is determined when instantiating a stream passing an option **objectMode**.
  - The **default objectMode** is `false`. Which means the **default mode** is `binary`.
- `Binary streams`: Only read or write Buffer instances.
- `Object streams`: Can read or write all Javascript Objects and Primitives (strings, numbers) - except null.

## Readable Streams

- We are using fs.createReadStream because it instantiates a ReadableStream and emit a data event after reading a chunk of data of the provided file, in this case we provided `__filename` (the same file in which the code were `index.js`).
- Readable streams have a default **highWaterMark** option to `16kb`, which means that it can read until `16kb` before emitting a data event. If your file has `32kb` it will emit two data events.

  ```javascript
  const fs = require("fs");
  const readable = fs.createReadStream(__filename);
  readable.on("data", (data) => {
    console.log("data", data); // data <Buffer 27 75 73 65 20 73 74 72 ... 345 more bytes>
  });

  readable.on("end", () => {
    // when there is no more data to be read
    console.log(" finished reading");
  });
  ```

- Readable streams are normally connected by a `c-binding` with an I/O layer (like files or network streams), but we can manually create one to exemplify.

  - `c-binding`: Interfaces with low-level system operations (e.g., file or network I/O) using native C++ bindings in Node.js.

  ```javascript
  const { Readable } = require("stream");
  const createReadStream = () => {
    const data = ["data", "here"];
    // creating using the new constructor
    return new Readable({
      // Encoding can be set outside the constructor to decode the buffer as a string
      // encoding: 'utf8', // Uncomment this if you want the stream to return data as a string
      // objectMode: true, // if you don't want to deal with buffers, but with objects and js primitives (strings, numbers)
      read() {
        if (data.length === 0)
          this.push(null); // null indicates the end of the stream
        else this.push(data.shift()); // push the data to the readable stream
      },
    });
  };
  const readable = createReadStream();
  readable.on("data", (data) => console.log("data", data)); // data <Buffer 64 61 74 61> // by default it is emitted as a binary buffer
  // If you set encoding to 'utf8', the data will be automatically decoded as a string instead of being emitted as a binary buffer.

  readable.on("end", () => console.log("finished reading"));
  ```

## Writable Streams

- We use `Writable` constructor to create writable streams. A writable stream could be used to write a file, write data to HTTP responses, or write to the terminal.
- We send data to a writable stream with the `write` method.

  ```javascript
  const { Writable } = require("stream");
  const createWriteStream = (data) => {
    return new Writable({
      // objectMode: true, // if you want to allow sending objects and all primitives like numbers
      write(chunk, enc, next) {
        data.push(chunk);
        next();
      },
    });
  };
  const data = [];
  const writable = createWriteStream(data);
  writable.on("finish", () => {
    console.log("finished writing", data);
  }); // where there is no more data to write
  writable.on("error", (err) => console.log("error", err));
  writable.write("A\n");

  // as streams inherit from EventEmitter if you don't have an error handler it will crash the process
  writable.write(1); // it breaks if you don't set objectMode to true

  writable.end("nothing more to write"); // this will trigger the finish event
  ```

## Readable-Writable Streams

### Duplex Stream

- `Duplex streams` are streams with both read and write interfaces.
- A good example of it is a `TCP network socket`, which enables **full-duplex communication** (both sending and receiving data simultaneously).

  - A TCP socket allows both parties (client and server) to send and receive data at the same time.
  - Same as how Node.js Duplex streams work, where the stream can be both readable (receiving data) and writable (sending data).

  ```javascript
  const net = require("net");
  // Server: Creates a TCP server that listens on port 3000
  net
    .createServer((socket) => {
      const interval = setInterval(() => socket.write("beat"), 1000); // Sends "beat" every second

      socket.on("data", (data) => socket.write(data.toString().toUpperCase())); // Responds with uppercase data
      socket.on("end", () => clearInterval(interval)); // Cleans up on disconnect
    })
    .listen(3000);

  // Client: Connects to the server
  const clientSocket = net.connect(3000);

  clientSocket.on("data", (data) => console.log("data:", data.toString())); // Logs received data
  clientSocket.write("here"); // Sends "here" to the server

  setTimeout(() => {
    clientSocket.write("all done"); // Sends "all done" after 2s
    setTimeout(() => clientSocket.end(), 100); // Ends the connection
  }, 2100);

  // This code establishes a TCP server that sends a heartbeat ("beat") every second to connected clients. The server also responds by converting received messages to uppercase. The client connects, sends messages, and closes after a short delay.

  // output
  // data: HERE
  // data: beat
  // data: beat
  // data: ALL DONE
  ```

  ### Transform Stream

  - The `Transform` constructor inherits from the `Duplex` constructor.
  - Data is written to the transform stream, and data events are emitted on the readable side of the same stream but in compressed format.

  ```javascript
  const { createGzip } = require("zlib");
  const transform = createGzip();

  transform.on("data", (data) => {
    console.log("gzip data", data.toString("base64"));
  });

  transform.write("first");
  transform.end("second");
  ```

  ### PassThrough Stream

  - PassThrough stream inherits from the Transform but it doesn't make any transformation.
    - Think in the identity function of math where `f(x) = x`.
  - The `PassThrough` stream is used to intercept data without transforming it.

  ```javascript
  const { PassThrough, Readable } = require("stream");
  const passThrough = new PassThrough();

  // Pipe data through the PassThrough stream
  passThrough.on("data", (chunk) => {
    console.log(`Chunk received: ${chunk.toString()}`); // here we just used the PassThrough stream to log
  });

  // Create a readable stream that emits some data
  const readable = Readable.from([
    "Hello, ",
    "this is ",
    "a stream ",
    "example!",
  ]);

  // Pipe the readable stream into the PassThrough stream and then to an writable stream (process.stdout)
  readable.pipe(passThrough).pipe(process.stdout); // writable stream
  ```

## Determine end of stream

- We have 4 ways to make a stream inoperative.
- Events: `close`, `finish`, `end`, and `error`.
- It's important to know when a stream has closed because we need to deallocate its resources in order to avoid memory leaks.
- Use `stream.finished` instead of listening for all 4 events to safely detect when a stream ends.

  - `finished(stream, (err) => { })`
  - error is received on finished if the event error was emitted

  ```javascript
  // same example used before to talk about Duplex Streams
  // but now we don't need to listen events like "end", "close", "error", "finish"
  const net = require("net");

  // Server
  const { finished } = require("stream");
  net
    .createServer((socket) => {
      const interval = setInterval(() => {
        socket.write("beat");
      }, 1000);
      socket.on("data", (data) => {
        socket.write(data.toString().toUpperCase());
      });
      finished(socket, (err) => {
        if (err) {
          console.error("there was a socket error", err);
        }
        clearInterval(interval);
      });
    })
    .listen(3000);

  // Client: Connects to the server
  const clientSocket = net.connect(3000);

  clientSocket.on("data", (data) => console.log("data:", data.toString())); // Logs received data
  clientSocket.write("here"); // Sends "here" to the server

  setTimeout(() => {
    clientSocket.write("all done"); // Sends "all done" after 2s
    setTimeout(() => clientSocket.end(), 100); // Ends the connection
  }, 2100);
  ```

## Piping Streams

- The pipe operator is already well-known for its use in the command-line interface (CLI), where it passes the result of the last operation to the next one. It has also been extended to Node.js.

  - `cat file | grep find-text`--> the result of cat file goes to grep

  ### Using the pipe method

  - `Pipe` method is present on `Readable streams`. (remember that duplex streams inherit from both writable and readable streams too)

    - Internally the `readableStream.pipe(writableStream)` method adds a listener for `data event` and sends the data directly to the writable stream.
    - Since pipe returns the stream passed to it we can chain multiple calls: `readableStream.pipe(duplexStream).pipe(writable2)`
      - Remember: we can't use pipe on writable streams so we can't add other pipe there.

    ```javascript
    // without pipe
    const net = require("net");
    const socket = net.connect(3000);

    // 1 - we have changed this event listener 'data'
    socket.on("data", (data) => {
      console.log("got data:", data.toString());
    });

    socket.write("hello");
    setTimeout(() => {
      socket.write("all done");
      setTimeout(() => {
        socket.end();
      }, 130);
    }, 1130);

    // with pipe
    const net = require("net");
    const socket = net.connect(3000);

    socket.pipe(process.stdout); // 1 - to this pipe sending to process.stdout which is a Writable stream

    socket.write("hello");
    setTimeout(() => {
      socket.write("all done");
      setTimeout(() => {
        socket.end();
      }, 130);
    }, 1130);
    ```

  ### Using the `pipeline` function

  - This is a good way to work with stream by creating a pipeline.
    - The pipeline command will call pipe on every stream passed to it.
    - It allows us to pass a final callback function (in the callback version) or use `try/catch` with `await` (in the Promises version) to handle any errors or closes across the entire pipeline.

  ```javascript
  import { pipeline } from "node:stream";
  import { createReadStream, createWriteStream } from "node:fs";
  import { createGzip } from "node:zlib";

  pipeline(
    createReadStream("archive.tar"),
    createGzip(),
    createWriteStream("archive.tar.gz"),
    (err) => {
      if (err) {
        console.error("Pipeline failed:", err);
      } else {
        console.log("Pipeline succeeded.");
      }
    }
  );
  ```

## Working with streams with async/await

- Import from module `node:stream/promises`.
