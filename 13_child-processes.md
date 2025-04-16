https://nodejs.org/dist/v22.x/docs/api/child_process.html

# Child Processes

- The `child_processes` module allows us to create new processes with the current one as the parent.
- A `child process` can be any executable written in any language, it doesn't have to be a Node.js process.

## Child Process Creation

- All functions above `exec(), execFile(), spawn(), fork()` are ways to create `subprocesses` in Node.js.
  - All of them return an object that is an instance of `ChildProcess`.
- When creating a **child process**, you are also spawning an entirely new and isolated **V8 instance** and **memory space**.

### `exec()`:

- Simplest way to run commands on shell in NodeJS, but it's not safe. We need to escape the user input to avoid security issues.

```javascript
const { exec, ChildProcess } = require("node:child_process");
const userInput = "test && rm -rf /"; // very dangerous!!! Don't run it
const subprocess = exec(`echo ${userInput}`, (err, stdout) => {
  console.log(stdout);
});
console.log(subprocess instanceof ChildProcess); // true
```

### `execFile()`:

- Is **safer** than `exec()` because it doesn't uses shell directly, we pass it to an array of strings that are the `args`.

```javascript
const { execFile, ChildProcess } = require("node:child_process");
const userInput = "test && rm -rf /"; // same input

// It will only pass the entire string as an argument and print it (SAFER)
const subprocess = execFile("echo", [userInput], (error, stdout, stderr) => {
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("stdout", stdout); // test && rm -rf /
});
console.log(subprocess instanceof ChildProcess); // true
```

### `execFile()` & `exec()` Error handling

- If you use `process.stderr` (console.error) but exits process with status 0 (default) it will not return any error.

```javascript
const { exec } = require("node:child_process");
const userInput = `test && echo "hello" && node -e "console.error('test error')" `;
exec(`echo ${userInput}`, (err, stdout, stderr) => {
  if (err) {
    console.error("err", err);
  }
  console.log("stdout", stdout);
  console.log("stderr", stderr);
});

/*
OUTPUT:

stdout test
hello
stderr test error
*/
```

- If you exits your process with status 1 it will return an error `process.exit(1)` or (throw new Error()).

```javascript
const { exec } = require("node:child_process");
const userInput = `test && echo "hello" && node -e "throw new Error('test error')" `;
exec(`echo ${userInput}`, (err, stdout, stderr) => {
  if (err) {
    console.error("err", err);
  }
  console.log("stdout", stdout);
  console.log("stderr", stderr);
});
/*
OUTPUT:

err Error: Command failed: echo test && echo "hello" && node -e "throw new Error('test error')"
[eval]:1
throw new Error('test error')
^

Error: test error
    at [eval]:1:7 ... stack trace
stdout test
hello

stderr [eval]:1
throw new Error('test error')
^

Error: test error
    at [eval]:1:7 ... stack trace
*/
```

### Running `Node.js child processes` on same node version with `process.execPath`

- It's important to know that we can use the `process.execPath` variable to get the **absolute path of the Node.js executable** currently running your code. This way we **ensure** our **child processes** will be **running** at the **same Node version**.

```javascript
const { execFile } = require("node:child_process");
execFile(
  process.execPath,
  ["-e", "console.log('hello from child')"],
  (err, stdout) => {
    if (err) {
      console.error("Child process error:", err);
      return;
    }
    console.log("Child output:", stdout); // hello from child
  }
);
```

### `spawn()`

- `exec()` and `execFile()` **buffer the child process output**, meaning they store the entire output in memory until the child process completes. These methods have a default **1MB buffer limit** for the output. If the output exceeds this limit, the process may throw an error, such as "maxBuffer exceeded", or the output may be truncated.
- In contrast, `spawn()` **streams the output** of the child process in real-time, without storing it in memory. This makes `spawn()` the **preferred choice** for **long-running processes** or when the child process generates **large amounts of output**.

```javascript
const { spawn, ChildProcess } = require("node:child_process");

const args = [
  `-e`,
  `console.log('subprocess stdio output'); throw new Error('fake error')`,
];
const subprocess = spawn(process.execPath, args);
console.log(subprocess instanceof ChildProcess); // true

subprocess.stdout.pipe(process.stdout); // subprocess stdio output
subprocess.stderr.pipe(process.stderr); // [eval]:1 console.log('subprocess stdio output'); throw new Error('fake error') ... stack trace
```

### `fork()`

- Is a specialization of the `spawn()` to run only `Node.js` processes.
- By default it will spawn a new Node.js instance with the `process.execPath` of parent process.
- It has some special features that others doesn't, for example: **IPC connection between parent and child processes** enabling a easy communication between both.
  - `IPC - Inter-Process Communication`: Allows message passing between parent and child processes.
  - `process.on('message', (msg) => {})`: Parent listens for messages from the child, and vice-versa.
  - `process.send(string|object)`: Used to send messages between parent and child processes.

```javascript
// parent.js
const { fork } = require("node:child_process");
const childFileName = "./child.js";
const child = fork(childFileName);
child.send({ testingObject: "Hello from parent" });
child.on("message", (msgFromChild) => {
  console.log("Parent received:", msgFromChild);
});

// child.js
process.on("message", (msg) => {
  console.log("Child received:", msg); // Child received: { testingObject: 'Hello from parent' }
  process.send(`Hello, parent! I received: "${JSON.stringify(msg)}"`);
  // Parent received: Hello, parent! I received: "{"testingObject":"Hello from parent"}"
});
```

### Differences between`fork()` and others: (`spawn()`, `exec()`, `execFile()`)

- `fork()` creates an IPC connection, allowing easy communication between parent and child processes via `process.send()` and `process.on('message')` - it's specifically used for **Node.js processes**.
- **With other methods** (`spawn()`, `exec()`, `execFile()`), communication is done using standard streams (`process.stdin`, `process.stdout`, `process.stderr`), without an IPC connection.

- So if you need communication you would need to handle it manually with streams, it's not that easy to work with non-primitive data like objects and to have the same security.

  ```javascript
  const { spawn } = require("child_process");
  const childCode = `
    process.stdin.on('data', (data) => {
      console.log('Child received:', data.toString());
      process.stdout.write('Hello from child!');
    });
  `;
  const subprocess = spawn(process.execPath, ["-e", childCode]); // Parent process creating child using spawn

  // Sending data to the child
  subprocess.stdin.write("Hello from parent!\n");
  // Receiving data from the child
  subprocess.stdout.on("data", (data) => {
    console.log("Parent received:", data.toString());
  });

  // OUTPUT:
  // Parent received: Child received: Hello from parent!
  // Parent received: Hello from child!
  ```

## Process Configuration When Creating Child Processes

- You can configure the working directory and environment variables of a child process using the `cwd` and `env` options.
- These options work with `spawn`, `fork`, `exec`, and their sync versions.
- The example above is just part of what can be configured. With `fork()`, for example, we can even run a child process in **detached mode**, allowing it to act like a **daemon process** that keeps running in the background even after the parent process has exited.

```javascript
const { IS_CHILD } = process.env;

if (IS_CHILD) {
  // CHILD
  console.log("subprocess cwd:", process.cwd());
  console.log("env", process.env);
} else {
  // PARENT
  const { spawn } = require("child_process");
  const { parse } = require("path");

  const parsedPath = parse(process.cwd());
  const sp = spawn(process.execPath, [__filename], {
    cwd: parsedPath.root, // current folder it will execute in
    env: { IS_CHILD: "1" },
  });

  sp.stdout.pipe(process.stdout);
}

// we are running this file twice and setting cwd of the child, and also sending environment variables
```

### We can also set directly the STDIO of the child process

- This allows us to **control** the input, output, and error **streams** of the **child process**, such as inheriting the parent's STDOUT or ignoring STDERR.
- We need to do a `sp.stind.end()`

```javascript
const { spawn } = require("child_process");
const sp = spawn(
  process.execPath,
  ["-e", 'console.error("err output"); process.stdin.pipe(process.stdout)'],
  {
    stdio: ["pipe", "inherit", "ignore"], // (stdin, stdout, stderr) --> pipe remains common behavior
  }
);

sp.stdin.write("this input will become output\n"); // because we are inheriting from the parent, it will be displayed directly
sp.stdin.end(); // needed to close the input stream of the child process - it keeps waiting for input until end
```

### Summary

| Method     | Uses Shell? | Streaming Support | IPC Channel? | Use Case                                       |
| ---------- | ----------- | ----------------- | ------------ | ---------------------------------------------- |
| exec()     | ✅ Yes      | ❌ No             | ❌ No        | Quick, simple command execution                |
| execFile() | ❌ No       | ❌ No             | ❌ No        | Safer command execution without shell          |
| spawn()    | ❌ No       | ✅ Yes            | ❌ No        | Real-time data streaming or long-running tasks |
| fork()     | ❌ No       | ✅ Yes            | ✅ Yes       | Running Node.js scripts with IPC support       |

## Extras; Outside off Node.js:

### `IPC - Inter-Process Communication`

- A method that allows different processes to communicate with each other, often used to exchange data or synchronize actions.

### `Daemon process`

- A program that runs in the background, performing tasks automatically and without direct user interaction.
