https://nodejs.org/dist/v22.11.0/docs/api/process.html
https://nodejs.org/dist/latest-v22.x/docs/api/os.html

# Process And Operating System

- The NodeJS `process` is the program currently running our code. We can control and collect information about a process using the global `process` object.
- The Operating System is the host where a process runs, we can also gather information about the Operating System of a running process using the core `os` module.

## STDIO - Standard input/output

- The `ability to interact with terminal I/O` is called STDIO.
- The `process` object exposes these **streams**:

  - `process.stdin`: Readable Stream for process input.
  - `process.stdout`: Writable Stream for process output.
  - `process.stderr`: Writable Stream for process error output.
  - These streams never finish, error or close. If one of these streams were to end, it would either cause the process to crash or it would end because the process exited.

  ### Example using stdin and stdout

  ```javascript
  const { Transform } = require("stream");
  const upperCaseTransform = new Transform({
    transform(chunk, econding, next) {
      next(null, chunk.toString().toUpperCase());
    },
  });

  console.log(process.stdin.isTTY ? "terminal" : "piped"); // process.stdin.isTTY determine if it's from pipe or terminal
  process.stdin.pipe(upperCaseTransform).pipe(process.stdout);

  // run: node -e "console.log('test')" | node index.js
  // OUTPUT:
  // piped
  // TEST

  // run: node index.js
  // OUTPUT: terminal
  // now type: hello
  // OUTPUT: HELLO
  ```

  ### Testing separated output of `STDERR`

  - With this example we can see that `stderr` was not sent to out.txt, because it goes to a `separated output`.
  - `console.log` writes to `STDOUT`, and `console.error` write to `STDERR`

  ```javascript
  const { Transform } = require("stream");
  const upperCaseTransform = new Transform({
    transform(chunk, econding, next) {
      next(null, chunk.toString().toUpperCase());
    },
  });

  // we add \n because console.log and console.error adds it automatically
  process.stderr.write(process.stdin.isTTY ? "terminal\n" : "piped\n"); // here we write to stderr
  process.stdin.pipe(upperCaseTransform).pipe(process.stdout);

  // run: node -e "console.log('test')" | node index.js > out.txt
  // OUTPUT on terminal:
  // piped

  // out.txt
  // TEST
  ```

  ### How to collect `STDERR` to an specific output? `2>`

  - On POSIX systems the number 2 is a common file handle that represents STDERR.
  - `node -e "console.log('test')" | node index.js > out.txt 2> err.txt`

## Exiting

- When a process has nothing left it exits by itself.
  ```javascript
  console.log("exits after this line");
  // OUTPUT: exits after this line
  ```
- An active handle is a reference that keeps the process open, for example, `net.createServer`, `setInterval`, `setTimeout`, etc...
- To **force a process to exit** we can use: `process.exit()`.
- **Exit codes**:
  - We use `0` for "success". `process.exit(0)`
  - We use `1` for "general failure". `process.exit(1)`

## Process Info

- The `process` object also contains information about the process.

```javascript
console.log("process.cwd()", process.cwd()); // process.cwd() /Users/user/jsnad-studies
console.log("process.platform", process.platform); // process.platform darwin
console.log("process.pid", process.pid); // process.pid 5131
console.log("process.env", process.env); // key value pairs, environment variables (don't leak to OS, loaded on the process)
```

## Process Stats

### `process.uptime()` the amount of seconds that the process has been executing for.

- Don't confuse it with host machine uptime, process is the program running our code.

```javascript
console.log("1st process.uptime()", process.uptime());
setTimeout(() => {
  console.log("2nd process.uptime()", process.uptime());
}, 1000);

// 1st process.uptime() 0.075394458
// 2nd process.uptime() 1.089451958
```

### `process.cpuUsage()`

- It returns an object with two properties **user** and **system**.
- **user**: time that the Node process spent using CPU - user mode (i.e., executing your JavaScript code)..
- **system**: time that the Kernel spent using the CPU due to activity triggered by the process - kernel mode (i.e., executing system-level operations on behalf of your process).
- Both are **microsecond** (one millionth of a second).
- To get the total CPU time in seconds, you can divide each value by 1_000_000.

### Example:

- In the first output of our example we have a `cpu usage` bigger than `uptime`. It occurs because `Node utilizes multiple cores`.

  - Yes, even though Node is single-threaded in terms of javascript execution, the runtime itself can run work in parallel.
  - This is a sign that Node.js (and its underlying V8 engine, libuv, and other native components) is utilizing multiple threads or cores, such as: garbage collection, I/O operations, etc...

  ```javascript
  const outputStats = () => {
    const uptime = process.uptime();
    const { user, system } = process.cpuUsage();

    console.log("uptime", uptime);
    console.log("user", user);
    console.log("system", system);
    console.log("(user + system) / 1000000", (user + system) / 1000000);
  };

  outputStats();

  setTimeout(() => {
    outputStats();
    const now = Date.now();
    while (Date.now() - now < 5000) {}
    outputStats();
  }, 500);

  /*
  uptime 0.022033458
  user 35273
  system 9665
  (user + system) / 1000000 0.044938 --> cpu usage is bigger than uptime, because nodejs uses more than one CPU core.
  
  uptime 0.524045667 --> increased 0.5 seconds as we've created a setTimeout of 500ms
  user 37033
  system 9887
  (user + system) / 1000000 0.04692
  
  uptime 5.52646875
  user 4918679
  system 33452
  (user + system) / 1000000 4.952131
  */
  ```

### `process.memoryUsage()`

- All numbers output by `process.memoryUsage()` are in bytes.
  - `rss - Resident set Size`: Total RAM used by the process.
  - `heapTotal`: Total heap memory allocated by V8 to run our code.
    - The total memory allocated for a process. The process reserves that memory, which can grow or shrink based on its behavior.
  - `heapUsed`: Heap memory actively in use to run our code (always ≤ heapTotal).
  - `external`: Memory usage by the C++ layer - it will not grow because once the JS program is running this layer doesn't need more memory.
  - `arrayBuffers`: Memory used by ArrayBuffer and TypedArray instances.
    - Because `ArrayBuffer` and `TypedArray` objects store binary data outside the regular JavaScript heap.

```javascript
// We are running a loop 6 times that creates 10k objects and pushes them to an array. After each 10k objects are added, we push the result of process.memoryUsage() into the stats array to analyze it later in a table.
const stats = [process.memoryUsage()];
let iterations = 5;
while (iterations--) {
  const arr = [];
  let i = 10000;
  while (i--) {
    arr.push({ [Math.random()]: Math.random() });
  }
  stats.push(process.memoryUsage());
}
console.table(stats);
/*
┌─────────┬──────────┬───────────┬──────────┬──────────┬──────────────┐
│ (index) │ rss      │ heapTotal │ heapUsed │ external │ arrayBuffers │
├─────────┼──────────┼───────────┼──────────┼──────────┼──────────────┤
│ 0       │ 34717696 │ 5062656   │ 3386376  │ 1156650  │ 10515        │
│ 1       │ 39485440 │ 10567680  │ 6068272  │ 1156690  │ 10515        │
│ 2       │ 48955392 │ 11878400  │ 8843096  │ 1156690  │ 10515        │
│ 3       │ 51478528 │ 17645568  │ 10880048 │ 1156690  │ 10515        │
│ 4       │ 55869440 │ 19742720  │ 12031536 │ 1156690  │ 10515        │
│ 5       │ 59998208 │ 21839872  │ 13580320 │ 1156690  │ 10515        │
└─────────┴──────────┴───────────┴──────────┴──────────┴──────────────┘
*/
```

## System Info

- The `os` module can be used to get system info.
- The OS cleans routinely the temp dir so it's a great place to store throwaway files without the need to remove them later.

```javascript
const os = require("os");

console.log("os.hostname()", os.hostname()); // Air-de-username
console.log("os.homedir()", os.homedir()); // /Users/usernamne
console.log("os.tmpdir()", os.tmpdir()); // /var/folders/yp/3lhthwy50md3c9k42hsjmm4h0000gn/T
console.log("(Operating system identifier uname) - os.type()", os.type()); // Darwin

// These are equal
console.log("os.platform()", os.platform()); // darwin
console.log("process.platform", process.platform); // darwin
console.log("os.arch()", os.arch()); // arm64
console.log("process.arch()", process.arch); // arm64
```

## System Stats

```javascript
const os = require("os");

setInterval(() => {
  console.log("os.uptime()", os.uptime()); // amount of time the system has been running (in seconds)
  console.log("os.freemem()", os.freemem()); // available system memory (in bytes)
  console.log("os.totalmem()", os.totalmem()); // total system memory (in bytes)
  console.log("---");
}, 1000);

/*
os.uptime() 1828
os.freemem() 429719552
os.totalmem() 8589934592
---
os.uptime() 1829
os.freemem() 493371392
os.totalmem() 8589934592
---
*/
```
