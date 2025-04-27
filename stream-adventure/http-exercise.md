## Summary of the exercise content:

- On native http module request and response objects are also streams.
- Knowing that, we can write more performatic code and waste less memory when sending a large file as response, and more..
  - At this example we are streaming the data from a `readable stream` **file** to a `writable stream` **res**.
  ```js
  const http = require("http");
  const fs = require("fs");
  const server = http.createServer(function (req, res) {
    fs.createReadStream("file.txt").pipe(res);
  });
  server.listen(8000);
  ```
- We can do the same but streaming the request to a file without buffering it all on memory:
  - At this example we are streaming the data from a `readable stream` **request** to a `writable stream` **file**.
  ```js
  const http = require("http");
  const fs = require("fs");
  const server = http.createServer(function (req, res) {
    if (req.method === "POST") {
      req.pipe(fs.createWriteStream("post.txt"));
    }
    res.end("beep boop\n"); // res.end runs first and the pipe continues on background asynchronously
  });
  server.listen(8000);
  ```

- You can test this post server with curl:

  ```bash
    $ node server.js &
    $ echo hack the planet | curl -d@- http://localhost:8000
    beep boop # res.end runs first and the pipe continues on background asynchronously
    $ cat post.txt
    hack the planet
  ```

- **In the last example** to make res.end only after finishing to stream all data to the file `post.txt` we would need to use:

  ```js
  const http = require("http");
  const fs = require("fs");
  const server = http.createServer(function (req, res) {
    if (req.method === "POST") {
      const file = fs.createWriteStream("post.txt");
      req.pipe(file);

      file.on("finish", () => {
        res.end("beep boop\n");
      });
    } else {
      res.end("beep boop\n");
    }
  });
  server.listen(8000);
  ```

**Flow**

- Incoming HTTP data ---> req receives chunks
  ---> req emits 'end'
  ---> file finishes writing last chunk
  ---> file emits 'finish'

## How to `finish` the `write stream` "manually" without `pipe`?

```js
const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    const file = fs.createWriteStream("post.txt");

    req.on("data", (chunk) => {
      file.write(chunk); // Write each chunk manually
    });

    req.on("end", () => {
      file.end(); // closes the writable stream and triggers 'finish' when done
      res.end("beep boop\n");
    });
  } else {
    res.end("beep boop\n");
  }
});

server.listen(8000);
```

## Solution of the HTTP exercise of stream-adventure
- [9.js](./9.js)