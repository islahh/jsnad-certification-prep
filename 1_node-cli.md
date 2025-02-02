# Node Command Line Interface - node binary

## Help commands

- To check node CLI flags: `node --help`
- There are also CLI flags to modify the V8 runtime engine: `node --v8-options`

## Check a NodeJS code syntax without running:

- `node --check index.js` or `node -c index.js`
- If the code does not parse due to a syntax error, the error will be printed to the terminal. If it parses correctly, you will receive no output.

## Dynamic evaluation - Test a code easily on CLI

- Used to evaluate NodeJS cross-platform code that uses NodeJS core APIs or Javascript.
- `node --print "1+1"` or `node -p "1+1"`
  - Evaluates the statement and prints the result
- `node --eval "1+1"` or `node -e "1+1"`
  - Evaluates the statement without printing the result
- Observations
  - `node -e "console.log(2)"` -> console.log prints 2
  - `node -p "console.log(2)"` -> console.log prints 2 and then -p prints undefined that is the value returned from console.log.
  - All node core modules are already ready to use without importing with `import` or `require`.
    - `node -e "fs.writeFileSync(__dirname+'/test.txt', 'hello world')"`

## Preload Modules

- It's a good idea if you have a module that configures the process or setup. A great example is the [.env](https://www.npmjs.com/package/dotenv) module.

- CommonJS
  - `node --require ./setup.js index.js` or `node -r ...`
  - `node --require dotenv/config your_script.js` or `node -r ...`
- ESM
  - `node --import ./setup.js index.js`

## Stack Trace Limit - Debugging CLI option

- A `stack trace` is generated for all occurred errors, they are the first thing we normally check when debugging javascript code.
- By default a stack trace will contain the last ten functions calls locations (stack frames) at the point where the trace occurred.
- But sometimes we want to check more call frames in a stack trace to ensure that the application flow through various functions is as expected.
- It's useful for debugging, but should never be used in production. Retaining long stack traces can create overhead.

### Hands-on

- To modify the stack trace limit: `node --stack-trace-limit=100 index.js`.
  - This is from the runtime engine V8 you can check more on `node --v8-options`
  - EX:
    ```javascript
    function loop(i = 99) {
      if (i === 0) throw Error();
      loop(i - 1);
    }
    loop();
    ```
    - It will call the function 100 times + 1 (first). To see the first call to `loop` function you need a `node --stack-trace-limit=101 index.js`
    - You could also guarantee any amount of calls using something like `node --stack-trace-limit=999999 index.js`

## Tips:

- To search specific stuff on `node -h` and `node --v8-options`:
  - `node -h | grep "evaluate"`
  - `node --v8-options | grep "limit" | grep "stack"`
