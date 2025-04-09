https://nodejs.org/dist/latest-v22.x/docs/api/path.html
https://nodejs.org/dist/latest-v22.x/docs/api/fs.html

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*

# File System

- When this module was created Javascript was a browser side language without primitives to interact with the file system.
- Javascript works with file system with `file system` module with the support of `path` module.
  - Use `fs` for file operations and `path` for platform-safe path manipulations.
- before reading all content:
  - `POSIX system`: Portable Operating System Interface. A set of rules defined to maintain `compatibility` between `UNIX-like systems`.

## File Paths and manipulation

- `__filename`: Absolute path of current file.
- `__dirname`: Absolute path of current file's directory.
- `path.join(string1, string2, stringN...)`: Builds safe cross-platform paths.

  - Windows uses backslashes (`\`) in paths, while POSIX systems (Linux/macOS) use forward slashes (`/`).
  - Handles differences automatically and escapes backslashes in Windows.
  - Example:

    ```javascript
    const { join } = require("path");
    console.log(join(__dirname, "myfile.txt"));
    // On Linux/macOS: /jsnad-studies/test/myfile.txt
    // On Windows: C:\\jsnad-studies\test\myfile.txt
    // path.join('foo', 'bar', 'baz'): 'foo/bar/baz' on POSIX, 'foo\\bar\\baz' on Windows.
    ```

- `path.isAbsolute(path)`: Checks if path is absolute.
- `path.relative(from, to)`: Relative path from one dir to another.
- `path.resolve(...)`: Resolves to absolute path like `cd` commands.
  - `path.resolve('/foo', 'bar', 'baz')` would return `/foo/bar/baz`
- `path.normalize(path)`: Cleans path (resolves `..`, `.` and also double slashs `//`).
  - `path.normalize('/foo/../bar//baz')` would return `'/bar/baz'`.
- `path.parse(path)`: Breaks path into `{ root, dir, base, ext, name }`.
- `path.format(obj)`: Builds a path string from an object generated for `path.parse`.
- `path.basename(path)`: Returns file name with extension.
- `path.dirname(path)`: Returns directory name.
- `path.extname(path)`: Returns file extension.

### Example of some path functions

- ```javascript
  const { parse, basename, dirname, extname } = require("path");
  console.log("filename parsed:", parse(__filename));
  console.log("filename basename:", basename(__filename));
  console.log("filename dirname:", dirname(__filename));
  console.log("filename extname:", extname(__filename));
  /* OUTPUT on MacOS: (POSIX)
    filename parsed: {
      root: '/',
      dir: '/Users/godinhojoao/personal/jsnad-studies',
      base: 'index.js',
      ext: '.js',
      name: 'index'
    }
    filename basename: index.js
    filename dirname: /Users/godinhojoao/personal/jsnad-studies
    filename extname: .js
    */
  ```

## Reading and Writing

- The `fs` `module mirrors POSIX` system calls (not a direct 1:1) at a low level (like fs.open), implemented through libuv rather than directly like the C standard library.
- `Higher-level abstractions` for file operations are **provided** via **synchronous, callback, promise, and stream-based** methods.
- **Node works best when I/O is handled in the background**, without blocking the event loop, so **sync it's not a good idea**.

  ### Sync methods

  - The sync file operations end with the word `sync` and they `block all the event loop` it means you `can't process anything else` while it is running.
  - Sync methods will throw error if there is something wrong, to handle it use `try/catch` block.

    - `readFileSync`, `writeFileSync`

      ```javascript
      const { join } = require("path");
      const { writeFileSync, readFileSync } = require("fs");

      const contents = readFileSync(__filename, { encoding: "utf8" });
      // we can pass this options here, and flag "a" means append to append the content instead of rewrite
      // it works same as UNIX and C standard library
      const options = { flag: "a" };
      writeFileSync(
        join(__dirname, "index.txt"),
        contents.toUpperCase() /*,options*/
      );
      // We've read the current file content and upper cased the contents and written it to an 'index.txt' file in the same directory.
      ```

  ### Callback methods

  - Same example using callback methods `readFile`, `writeFile`

  ```javascript
  const { join } = require("path");
  const { readFile, writeFile } = require("fs");
  readFile(__filename, { encoding: "utf8" }, (err, contents) => {
    if (err) {
      console.error(err);
      return;
    }
    const out = join(__dirname, "index.txt");
    writeFile(out, contents.toUpperCase(), (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
  ```

  ### Async methods

  - Same exmaple using async methods from `fs/promises`: `readFile`, `writeFile`

  ```javascript
  const { join } = require("path");
  const { readFile, writeFile } = require("fs/promises");
  async function run() {
    const contents = await readFile(__filename, { encoding: "utf8" });
    const out = join(__dirname, "index.txt");
    await writeFile(out, contents.toUpperCase());
  }

  run().catch(console.error);
  ```

## File Streams

- Now we will talk about the `fs` stream methods.
- `Streams` allows us to read and write files in chunk, ideal when `handling very large files` that can be `processed incrementally`.
- The example above is great because the memory usage stay constant even reading a large file.

```javascript
const { pipeline, Transform } = require("stream");
const { join } = require("path");
const { createReadStream, createWriteStream } = require("fs");

const upperCaseTransform = new Transform({
  transform(chunk, encoding, next) {
    const upperChunk = chunk.toString().toUpperCase();
    next(null, upperChunk);
  },
});

pipeline(
  createReadStream(__filename),
  upperCaseTransform,
  createWriteStream(join(__dirname, "out.txt"), { flags: "a" }), // append mode but we can remove this flag
  (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("finished writing");
  }
);
```

## Reading Directories

- There are also synchronous, callback-based, and async iterable methods. The stream-like API (async iterators) is best suited for extremely large directories. **I will ignore the synchronous method**
- Output of examples above: `promise [ 'index.js', 'test.txt' ]`

  ### Callback based

  ```javascript
  const { readdir } = require("fs");
  try {
    console.log("sync", readdirSync(__dirname));
  } catch (err) {
    console.error(err);
  }
  ```

  ### Async based

  ```javascript
  const { readdir } = require("fs/promises");
  async function run() {
    const files = await readdir(__dirname);
    console.log("promise", files);
  }

  run().catch((err) => {
    console.error(err);
  });
  ```

  ### fs.Dir async iterable - What is `dir` in `fs.opendir()`?

  - When using `fs.opendir(path, callback)`, the second argument (`dir`) is an instance of `fs.Dir`. It represents a handle to a directory and allows you to read its contents asynchronously.
  - `dir` is **not** an array of file names. Instead, it's an **async iterable** that provides each file or folder (as a `fs.Dirent` object) one by one using:

  ```javascript
  for await (const entry of dir) {
    console.log(entry.name);
  }

  // it allows us to use Readable.from that accepts an async iterator and turn it into a readable stream
  const dirStream = Readable.from(dir); // and now you can create a pipeline to proccess it in chunks
  ```

## File Metadata

- Use `fs.promises.stat()` for non-blocking file metadata.
- Follows symlinks (use `lstat()` if you want symlink info)
- Returns `fs.Stats` object

  ### Common properties:

  - `isDirectory()` → is it a folder?
  - `atime` → last access time
  - `mtime` → last modified
  - `ctime` → last status change
  - `birthtime` → creation time

  ### Example (async methods):

  ```javascript
  import { readdir, stat } from "fs/promises";
  const files = await readdir(".");

  for (const name of files) {
    const stats = await stat(name);
    const label = stats.isDirectory() ? "dir:" : "file:";
    console.log(`${label} ${name}`);
    console.log("atime:     ", stats.atime.toLocaleString());
    console.log("mtime:     ", stats.mtime.toLocaleString());
    console.log("ctime:     ", stats.ctime.toLocaleString());
    console.log("birthtime: ", stats.birthtime.toLocaleString());
    console.log("\n");
  }
  ```

## Watching

- We can use both `fs.watch` or [chokidar](https://www.npmjs.com/package/chokidar), that is an popular external library to to monitor file system changes such as file creation, modification, or deletion.

  - `fs.watch` is built into Node.js and provides **basic file watching capabilities**, but it can be **inconsistent across platforms** and doesn’t support **recursive watching** reliably.
    - It is part of the Node.js core and is built on top of **underlying operating system APIs**, which vary depending on the platform.
  - `chokidar`, on the other hand, is `more robust and reliable`. It supports recursive watching out of the box, `handles cross-platform issues gracefully`, and includes features like debouncing, ignoring specific paths, and watching symbolic links.

  ### fs.watch default events

  - Creating a new file triggers a `rename` event.
  - Creating a new folder triggers a `rename` event.
  - Changing folder permissions initially triggers a `rename` event.
  - Writing the same content to a file triggers a `change` event.
  - Changing folder permissions again triggers a `change` event.
  - Deleting a file triggers a `rename` event.

  ```javascript
  const { watch } = require("fs");
  watch(".", (evt, filename) => {
    console.log(evt, filename);
  });
  // OUTPUT
  // change index.js (I've modified file content)
  // change 10_file-system.md (I've modified file content)
  // rename created-now.txt (I've created a new file)
  // rename created-now-folder (I've created a new folder)
  ```

  ### Combining `stat` and `fs.watch`

  - We can combine `fs.watch` and `fs.stat` to analyze if a file was `created`, `content-updated`, `status-updated`, or even `deleted`, based on its existence and `metadata changes`.

  ```javascript
  const { join, resolve } = require("path");
  const { watch, readdirSync, statSync } = require("fs");

  const cwd = resolve(".");
  const files = new Set(readdirSync("."));

  watch(".", (event, filename) => {
    const path = join(cwd, filename);
    try {
      const stats = statSync(path);
      if (!files.has(filename)) {
        files.add(filename);
        event = "created";
      } else {
        event =
          stats.ctimeMs === stats.mtimeMs
            ? "content-updated"
            : "status-updated";
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        files.delete(filename);
        event = "deleted";
      } else {
        console.error(err);
      }
    }
    console.log(event, filename);
  });

  // OUTPUT
  // content-updated index.js
  // created new.js
  // created new
  // deleted new
  ```
