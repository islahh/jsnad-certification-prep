https://nodejs.org/docs/latest-v22.x/api/esm.html#differences-between-es-modules-and-commonjs

# Node Module Systems

- In Node.js, a module is the unit of code that can be imported and used in other files.
- Packages expose modules, and modules expose functionality (e.g., functions, classes, or objects).
- In Node.js, each file can act as a module, so libraries (which are collections of modules) are also modules.

## Loading a Module with CJS

- Once we've installed the pino dependency on our `package.json` and it is on `node_modules` we are able to load it on our code.
  ```javascript
  const pino = require("pino"); // nodejs checks on node_modules folder for 'pino' and return its main exported file.
  const logger = pino();
  logger.info("my-package started");
  process.stdin.resume();
  ```
- The `require` function is passed a package's namespace and **looks for a directory** with that name on the `node_modules` folder and returns the exported value from the main file of that package.

## Creating a CJS Module

```javascript
// ./validator.js
function validateString() {
  console.log("test");
}
module.exports = { validateString }; // everything on module.exports is exported as a CJS module

// ./index.js
const validator = require("./validator"); // .js is not required but is accepted
validator.validateString(); // prints 'test'
```

## Detecting Main Module in CJS

- The main module is declared on `package.json` for example: `"main": "index.js"`.
- And it is the **entry point** of a program.
- We can detect if the current file is being loaded as the `main module` or `imported as a module`:
  - Loaded as the main module = executed with `node`.

```javascript
// index.js
if (require.main === module) {
  // if started as the main module
  console.log("executed with node");
} else {
  // if required in another file
  console.log("now I'm a module");
}
```

- `node index.js`: prints "executed with node"
- `node -e "require('./index');"` prints "now I'm a module"

## Converting a Local CJS File to a Local ESM File

- EcmaScript specification was introduced as part of EcmaScript 6.
- One of the main goals of the specification was for module includes to be `statically analyzable` which allows browsers to `pre-parse out imports` similar to collecting any `<script>` tags as the web page loads.

  - Means that, due to the predictable ESM syntax for `import` and `export` statements being `strictly defined at the top level of files`, browsers and tools can **analyze** the **module structure ahead of time** during the compilation phase, **without needing to execute the code**. This early analysis allows for **optimizations**, such as **preloading dependencies**, which ultimately improves performance.
  - `Top-level imports and exports` means that the `import` and `export` keywords must appear at the top level of a module, not inside functions, loops, or conditional statements.

  ### ESM modules vs CJS modules (loading modules)

  - `CJS`: loads every module synchronously, which **can be bad in browsers** where you sometimes need to lazy load something to **avoid blocking the main thread** and negatively impacting page performance.
  - `ESM modules`: Load every module asynchronously, making them **more efficient for browsers** by behaving similarly to `<script>` tags with **non-blocking module loading**.

  ### Can I use both at same time?

  - **Important**: It's not a good idea since `ESM` is asynchronous and `CJS` is synchronous your api must be changed everytime you want to import an `ESM` module within a `CJS`. ESM imports return a promise, you can `await` it on a CJS module.
  - If we want to use both at the same time in our `Nodejs` project we can. But we need to take some caution:
    - files using `CJS` should be `file.cjs`.
    - files using `ESM` should be `file.mjs`.
    - If all are using same pattern we can use only `file.js`.

  ### Static imports vs Dynamic imports

  - Both have their usecases.
  - **Static**: The use of `import` and `export` at the top level of the file, which enables for optimizations on compile time before running the code.
    ```javascript
    import { myFunction } from "./module.js";
    myFunction();
    ```
  - **Dynamic**: You can use `import` and `export` inside an 'if' or a 'function' for example but it can't be preloaded at compile time. It will be lazy loaded, only when necessary.

  ```javascript
  async function loadModule(condition) {
    if (condition) {
      const module = await import("./module.js");
      module.myFunction();
    }
  }
  ```

## "ESM by default" and the Syntax

- Put on your package.json: `{ "type": "module" }`.
- It enables **TLA**: Top-Level Await since the modules are loaded asyncrhonously. You can also use the import and export keywords.
- **`Import * as` when you have many exports:**

  ```javascript
  // my-module.js
  export function foo() {}
  export function bar() {}

  // index.js
  import * as myModule from "./my-module.js"; // on ESM we can't load modules without the full file name (extension included)
  myModule.foo();
  myModule.bar();
  ```

- **`Default` import and export**:

  ```javascript
  // validator.js
  const validator = { test: () => console.log("test") };
  export default validator;

  // index.js
  import validator from "./validator.js";
  validator.test();
  ```

- **`Named` import and export**:

  ```javascript
  // validator.js
  const validator = { test: () => console.log("test") };
  export { validator };
  // or
  export const validator = { test: () => console.log("test") };

  // index.js
  import { validator } from "./validator.js";
  validator.test();
  ```
