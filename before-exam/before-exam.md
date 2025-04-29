## Before the Exam

- 1st - Complete the quizzes: https://courses.dwf.dev/docs/javascript/jsnad-course-notes#quizzes
  - there are some answers in the site wrong (but you can check the Node.JS docs for answers)
- 2nd - Read the summaries at this file
- 3rd - Review exercises you've solved yourself
- 4th - Focus on the topics with the highest weight in the exam and review related exercises
  - Remember, don't waste your time on hard questions at the start of the exam.

## "Quick Summary"

- [x] Asynchronous Control flow — 12 %
- [x] Buffer and Streams — 11%

  - Buffers

    ```js
    Buffer.alloc(10); // Allocates and Initializes memory with zeros
    Buffer.from("test", "utf-8"); // starts a buffer from utf-8 string
    Buffer.from("test", "utf-8").toString("base64"); // changes to base64 str

    const aBufferBase64 = Buffer.from("QQ==", "base64");
    console.log(aBufferBase64.toString("utf-8")); // A
    ```

  - Streams

    - Readable

      - source of data we can read from
      - ex: `process.stdin` is a readable
      - custom:
        ```js
        import { Readable } from "node:stream";
        const r = new Readable({
          read() {
            this.push("hi\n");
            this.push(null); // this emits 'end' event
          },
        });
        r.pipe(process.stdout);
        ```
      - we can also pause a readable stream with `myReadable.pause()`
      - and return with `myReadable.resume()`
      - when you do a `pipe`, or `on('data')` it automatically is "unpaused"
      - `this.push(null);` -> this ends a readable string, inside the read func. (emits `end` event).
      - `this.destroy();` -> this ends **a stream**, inside the write/read func. (emits `close` event)

    - Writable

      - we write data into it
      - ex: `process.stdout` is writable
      - custom:
        ```js
        import { Writable } from "node:stream";
        const w = new Writable({
          write(chunk, encoding, cb) {
            console.log("got:", chunk.toString());
            cb();
          },
        });
        w.write("hey\n");
        ```
        - `this.destroy();` -> this ends **a stream**, inside the write/read func. (emits `close` event)

    - Duplex

      - both readable + writable
      - ex: socket
      - basic:
        ```js
        import { Duplex } from "node:stream";
        const d = new Duplex({
          read() {
            this.push("yo\n");
            this.push(null);
          },
          write(chunk, enconding, cb) {
            console.log("->", chunk.toString());
            cb();
          },
        });
        d.pipe(process.stdout);
        d.write("test\n");
        ```

    - Transform

      - duplex that changes data
      - ex: uppercase
        ```js
        import { Transform } from "node:stream";
        const t = new Transform({
          transform(chunk, enconding, cb) {
            cb(null, chunk.toString().toUpperCase());
          },
          flush(cb) { // runs only once in the end
            // this.push(datahere) it send the data to the next pipe
            return cb();
          },
        });
        process.stdin.pipe(t).pipe(process.stdout);
        ```

    - PassThrough

      - transform that changes nothing
      - good for debug/logging
        ```js
        import { PassThrough } from "node:stream";
        const p = new PassThrough();
        p.on("data", (chunk) => console.log(">", chunk.toString()));
        process.stdin.pipe(p).pipe(process.stdout);
        ```

    - more
      - pipe (it returns the last stream)
      - `readable.pipe(writable)` → allows us to connect the output of the readable to the writable
      - `readable.pipe(duplex).pipe(writable)` -> with a duplex we can chain it
    - `fs.createReadStream('file.txt')` → gets a file path and returns a **readable stream**
    - `fs.createWritableStream('file.txt')` → gets a file path and returns a **writable stream**

- [x] Events — 11%

  ```js
  import { EventEmitter } from "node:events";
  const ev = new EventEmitter();

  // Listener
  const show = (msg) => console.log("msg:", msg);
  ev.on("msg", show);

  ev.emit("msg", "hello"); // → msg: hello
  ev.removeListener("msg", show);
  ev.emit("msg", "will not show"); // No listener

  // One-time listener
  ev.once("onceEv", (val) => console.log("once:", val));
  ev.emit("onceEv", "run once"); // → once: run once
  ev.emit("onceEv", "ignored"); // Ignored

  // Handle error event (avoids crash)
  // without this listener to error event process crashes
  ev.on("error", (e) => console.error("error:", e.message));
  ev.emit("error", new Error("oops")); // → error: oops
  ```

- [x] Child Processes — 8%

  - exec: To exec shell commands (not safe)

    ```js
    const { exec, execFile } = require("node:child_process");
    const userInput = `test && echo "hello" && node -e "console.error('test error')" `;
    exec(`echo ${userInput}`, (err, stdout, stderr) => {
      if (err) {
        console.error("err", err);
      }
      console.log("stdout", stdout);
      console.log("stderr", stderr);
    });

    // execFile is safer:
    execFile(
      process.execPath,
      ["-e", "console.log('hello')"],
      (err, stdout) => {}
    );
    ```

  - Spawn: To spawn a process (securely) - we can pass env variables, etc..
    - `const subprocess = spawn(process.execPath, ['-e', 'console.log('testing')], { env: { VARIABLE_HERE: true }, stdio: [ignore, inherit, pipe] } )'`
      - `pipe`: **Redirects** the child's output/input to a stream you
        can **access from the parent** (e.g., for reading or writing).
      - `inherit`: **Shares** the **parent's stdio**
        (stdin, stdout, stderr) **with the child process** (same terminal).
      - `ignore`: **Disables** the **stdio stream for the child process**;
        it **won’t read or write anything**.
    - `subprocess.stdout.pipe(process.stdout); // send subprocess stdout to process output`
    - `subprocess.stderr.pipe(process.stderr);`
  - FORK: The best to run node files
    - `const child = fork(nodeFilePath)`
    - `child.send({msg: "hello"})`
    - `child.on('message', (messageFromChild) => {})`

- [x] File System — 8%
- [x] Error Handling — 8%
- [x] JavaScript Prerequisites — 7%
  - closure state, this, scope, etc..
  - function prefixed(prefix) { return function(name) { console.log(prefix + name) } }
    const prefixedHello = prefixed('hello'); prefixedHello('joao')
  - Prototype Ways to work with on js
    ```js
    // Object.create(obj, obj2) // creates a new object with obj as its prototype and adds properties from obj2 to the new object.
    const animal = {
      makeSound: () => {
        console.log("animal sound");
      },
    };
    const objWithRoar = {
      roar: { // property name
        value: () => { // value of this property
          console.log("roar!!");
        },
      },
      name: { value: "testing name" }
    }
    const lion = Object.create(animal, objWithRoar);

    console.log('Object.getPrototypeOf(lion) == animal', Object.getPrototypeOf(lion) == animal) // true
    console.log('Object.getPrototypeOf(lion) == objWithRoar', Object.getPrototypeOf(lion) == objWithRoar) // false

    lion.makeSound() // animal sound
    lion.roar() // roar!!
    console.log(lion.name) // testing name
    ```
- [x] Module system — 7%
- [x] Diagnostics — 6% (debugging)
  - `node -—inspect-brk app.js` —> runs stopping on first line - after just oppen chrome://inspect
  - `debugger;` (breakpoint on code)
- [x] Process/Operating System — 6%

  ```js
  console.log(process.uptime()); // TODO output uptime of process
  console.log(os.uptime()); // TODO output uptime of OS
  console.log(os.totalmem()); // TODO output total system memory
  console.log(process.memoryUsage().heapTotal); // TODO output total heap memory

  // Remember: HEAP is from the process, while system means OS
  // Operational System
  ```

- [x] Package.json — 6%
  - [x] semver VERY IMPORTANT
  - `npm i lib@^1.2.3` → Installs `1.2.3` or higher within `1.x.x`
    - ^ does not change the major
  - `npm i lib@~1.2.3` → Installs `1.2.3` or higher within `1.2.x`
    - ~ does not change major nor minor
  - `npm i lib@*` → Installs **any version**
  - `npm i lib@">=1.2.0 <2.0.0"` → Installs version **between `1.2.0` and before `2.0.0`**
  - **MAJOR**: `1.0.0` → Breaking changes (incompatible API changes)
  - **MINOR**: `0.1.0` → New features
  - **PATCH**: `0.0.1` → Bug fixes
  - `npm outdated` lists the outdated packages, wanted version and latest version
  - `npm update` update automatically to “wanted version”
  - `npm i lib@latest` update to the latest version
- [x] Unit Testing — 6%
  - modules: `import assert from ‘node:assert’` & `import { test } from 'node:test'`
  - General
    - `assert.strict.deepEqual(obj1, obj2)`
    - `assert.strict.equal(val1, val2)`
  - Handling errors
    - `assert.doesNotThrow(() => add(5, 3))`
    - `assert.throws(() => add("123", "abc"), Error('input must be numbers')`
  - Handling async errors
    - `assert.rejects(() => addAsync("abc", 5), Error('input must be numbers')`
- [x] Node.js CLI — 4%
  - `node -e "console.log('hello')"` → to run code
  - `node -p "console.log('hello')"` → to run code and print return
  - `node --stack-trace-limit=200 app.js` → to limit stack trace
  - `node --import ./setup.js app.js` —> preload ESM modules
  - `node --require ./setup.js app.js` —> preload CJS modules
  - `node -h` —> to see CLI help commands
    - use grep to filter: `node -h | grep “preload”`
