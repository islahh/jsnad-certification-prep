https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks
https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
https://developer.mozilla.org/en-US/docs/Web/API/AbortController

# Asynchronous Control Flow

- I/O operations are **handled asynchronously** in the libuv thread pool. But they may **appear as parallel execution** to the developer due to the unpredictability of the completion order.
  - Asynchronously means that it's handled "in background" without blocking the main thread, it's handled on a different thread.
- It uses a **single-threaded event loop** to **process asynchronous tasks** and **manage non-blocking I/O** operations.

## Callbacks

- Once the task has been completed it will execute the callback function. "The callback is waiting for the end of the task".

```javascript
const { readFile } = require("fs");
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename); // __filename: current file path
// We are using the same file here for study purposes, but let’s imagine these are different files of varying sizes.

const print = (err, contents) => {
  // called once readFile finishes (with error or success)
  if (err) {
    console.error(err);
    return;
  }
  console.log(contents.toString());
};

// Parallel Execution (it runs concurrently in the background on the libuv thread pool.
// It looks parallel because these tasks run independently, and the order of completion is unpredictable.
// In this case, the smallest file is likely to return first.)
readFile(bigFile, print);
readFile(mediumFile, print);
readFile(smallFile, print);

// Serial Execution (if we want a specific order)
readFile(bigFile, (err, contents) => {
  // 1st big
  print(err, contents);
  readFile(mediumFile, (err, contents) => {
    // 2nd medium
    print(err, contents);
    readFile(smallFile, print); // 3rd small
  });
});
```

## Promises

- Promises are javascript objects that can be `pending` or `settled`, if settled they can be: `rejected` or `resolved`.
- Read more: https://dev.to/godinhojoao/still-struggling-with-javascript-promises-kdh

```javascript
const { readFile } = require("fs").promises;
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename); // __filename: current file path
const print = (contents) => {
  console.log(contents.toString());
};

// Parallel Execution (it runs concurrently in the background on the libuv thread pool, but looks parallel on js)
const files = [bigFile, mediumFile, smallFile]
const readersPromises = files.map((file) => readFile(file))
Promise.all(readersPromises)
  .then(print);
  .catch(console.error);

// Serial Execution (specific order)
readFile(bigFile) // 1st big
  .then((contents) => {
    print(contents);
    return readFile(mediumFile); // 2nd medium
  })
  .then((contents) => {
    print(contents);
    return readFile(smallFile); // 3rd small
  })
  .then(print)
  .catch(console.error);
```

## Async/Await

- Syntax sugar for promises. You don't need .then to handle success, etc...

```javascript
const { readFile } = require("fs").promises;
const [bigFile, mediumFile, smallFile] = Array.from(Array(3)).fill(__filename); // __filename: current file path
const print = (contents) => {
  console.log(contents.toString());
};

// Parallel Execution (concurrently behind the scenes as I mentioned before)
const files = [bigFile, mediumFile, smallFile];
const readersPromises = files.map((file) => readFile(file));
async function testParallel() {
  try {
    const results = await Promise.all(readersPromises);
    // don't need then to use results
    print(Buffer.concat(results));
  } catch (err) {
    console.error(err);
  }
}
testParallel();

// Serial Execution (specific order)
async function testSerial() {
  const bigFileResult = await readFile(bigFile); // 1st big
  const mediumFileResult = await readFile(mediumFile); // 2nd medium
  const smallFileResult = await readFile(smallFile); // 3rd small
  // don't need then to use the results
  print(Buffer.concat([bigFileResult, mediumFileResult, smallFileResult]));
}
testSerial().catch(console.error); // here we could also use try catch blocks inside the async function, but for study purposes I'm using .catch here
```

## Canceling Asynchronous Operations

- We use [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) with AbortSignal for cancelling asynchronous operations.

- **Cancelling a global setTimeout with callback**:

```javascript
const timeoutIdentifier = setTimeout(() => {
  console.log("will not be logged");
}, 1000);

setImmediate(() => {
  clearTimeout(timeoutIdentifier); // clear global setTimeout correctly
});
// Outputs nothing since it's cleared before callback can be called.
```

- **Trying to do the same with the setTimeout from the core `timers/promises`** (ESM Top-Level Await TLA)

```javascript
import { setTimeout } from "timers/promises";

const timeout = setTimeout(1000, "value");
console.log(timeout); // Promise { <pending> } --> it's not an identifier anymore, but a Promise

setImmediate(() => {
  clearTimeout(timeout); // don't do this, it won't work
});

const result = await timeout;
console.log(result); // value
```

### How to cancell a Promise? AbortController & AbortSignal

- Many parts of the Node core API accept a signal option to abort the execution. (fs, net, http, events, stream...)

```javascript
import { setTimeout } from "timers/promises";

const abortController = new AbortController();
const { signal } = abortController;
const timeout = setTimeout(1000, "will NOT be logged", { signal });

setImmediate(() => {
  abortController.abort();
});

try {
  console.log(await timeout);
} catch (err) {
  console.log(err); // AbortError: The operation was aborted
  // ignore abort errors:
  if (err.code !== "ABORT_ERR") throw err;
}
```

- **Using `AbortController` and `AbortSignal` to abort an API call with fetch.**

```javascript
const abortController = new AbortController();
const { signal } = abortController;

async function fetchData(signal) {
  try {
    const response = await fetch("https://www.google.com", { signal });
    const data = await response.text();
    console.log("Data fetched:", data.substring(0, 100)); // Print the first 100 chars
  } catch (err) {
    console.log(err); //[AbortError]: This operation was aborted
  }
}

const fetchPromise = fetchData(signal);
setTimeout(() => abortController.abort(), 10); // Abort the request after 10ms
await fetchPromise;
```
