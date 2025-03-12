https://nodejs.org/docs/latest-v22.x/api/errors.html
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
https://medium.com/better-programming/try-catch-considered-harmful-4238ddd7cd3c

# Error Handling

- In this file we will focus on managing and propagating errors in synchronous, promise-based and async/await, and callback based scenarios.
- Note that here we are covering the main resources of JS and NodeJS core, but it's important to consider certain aspects of your code. For example:
  - Avoid using `try/catch` for expected validations, as it can result in messy code that is hard to read and may lead to unexpected behavior. Use `try/catch` only `to handle unexpected cases (operational errors)`, such as `network errors`.
  - For `validation errors` prefer to use `objects` or other structures that avoid messy code with GOTOs.
  - For more read: https://medium.com/better-programming/try-catch-considered-harmful-4238ddd7cd3c
  - Summary:
    - **Validation error**: avoid try/catch.
    - **Operational error**: use try/catch.

## Kinds of Errors

### Operational errors

- Occurs when the program is executing a task; (e.g. network failure).
- **Recovery strategy**: Ideally we should be able to recover the application from operational errors, in the case of a network failure we could implement a `retry` strategy.

### Developer errors:

- Invalid input is one example of developer error.
- **Recovery strategy**: In the case of a developer error the program should not attempt to continue running and should instead crash with a helpful description so that the developer can address their mistake.

## Throwing

- Typically an input error is dealt using the `throw` keyword.
- In this case if the function is called with a non-number the program will crash with `throw new Error('msg')`.
- We could throw a string or any other value, but the **ideal approach** is to **throw an Error instance** or an **object that extends the Error class**.
  - Because the `Error class` automatically generates a `stack trace` for debugging.
  - So only throw objects that derive from the native Error constructor.

```javascript
function validateInput(amount) {
  if (typeof amount !== "number")
    throw new TypeError("amount must be a number");
  if (amount > 10)
    throw new RangeError("amount must be less than or equal to 10");
  return amount / 2;
}
```

## Native Error Constructors

- **EvalError**: Occurs when an error related to the global `eval()` function happens.
- **RangeError**: Happens when a numeric variable or parameter is outside its allowable range.
- **ReferenceError**: Thrown when trying to reference an undeclared variable or object.
- **SyntaxError**: Indicates an error in the syntax of JavaScript code.
- **TypeError**: Raised when a variable or parameter is not of an expected type.
- **AggregateError**: Represents multiple errors wrapped in a single error object, commonly used with `Promise.any()`.
- How to check if the object is instance of a given class in JS? `object instanceof Constructor`
  - Example: `errVariable instanceof RangeError`

## Custom Errors and Try/Catch

- Native errors can't handle all possible application errors. There are different approachs to communicate error cases but we will explore two: `subclassing native error constructors` and using a `code property`.
- We use Try/Catch to handle unexpected errors. Try = success, catch = error.

- `using a code property`:
```javascript
function validateEven(num) {
  if (typeof num !== "number") throw new TypeError("num must be a number");
  if (num > 10) throw new RangeError("num must be less than or equal to 10");
  if (num % 2 !== 0) {
    const err = new Error("Num must be even");
    err.code = "ERR_MUST_BE_EVEN";
    throw err;
  }
  return num / 2;
}

// and now we can handle using this code
try {
  const res = validateEven(3);
  console.log("res", res);
} catch (error) {
  console.log("error", error); // error (+stack trace)
  console.log("error.code", error.code); // error.code ERR_MUST_BE_EVEN (code can be used to handle the error)
}
```

- `subclassing native error constructors`
```javascript
class MustBeEvenError extends Error {
  constructor(varName) {
    super(`${varName} must be even.`);
  }
  get name() { return 'MustBeEvenError' } // getter, called every time when: errorVariable.name
}

function validateEven(num) {
  if (typeof num !== "number") throw new TypeError("num must be a number");
  if (num > 10) throw new RangeError("num must be less than or equal to 10");
  if (num % 2 !== 0) {
    throw new MustBeEvenError('num')
  }
  return num / 2;
}
try {
  let res = validateEven(3)
  console.log('res', res)
} catch (error) {
  console.log('error', error) // error MustBeEvenError: num must be even. (+stack trace)
  // we could use instanceof to handle here
}
```

## Rejections:

- **Exceptions** are synchronous errors.
- **Rejections** are asynchronous errors - remember `Promise.reject()`.
  - To handle a promise use `.then` and `.catch` or `try/catch blocks`.
- In the current LTS version NodeJS by default is not sending `UnhandledPromiseRejectionWarning`. But instead of it is `crashing` the program with an `exception`.
  - To check the warning use the flag: `NODE_OPTIONS="--unhandled-rejections=warn" node index.js`
  ```javascript
    function validateNum(num) {
      return new Promise((resolve, reject) => {
        if (typeof num !== "number") {
          reject(new TypeError("num must be a number"));
          return;
        }
        if (num > 10) {
          reject(new RangeError("num must be less than or equal to 10"));
          return;
        }
        resolve(num / 2);
      });
    }
    validateNum(11);
    // Using the flag: crash + UnhandledPromiseRejectionWarning + exception with the stack trace
    // Without the flag: crash + exception with the stack trace
  ```

## Propagation

- We normally handle the error in the caller. So we could have a single try/catch block at a high level.
- If we want to handle it in the caller we can "rethrow" the error inside a catch block.
- But consider this before using it - it can make your code unreadable and hard to debug in some cases.
```javascript
async function doA() {
  const myErr = new Error("Error in doA");
  myErr.code = "abc";
  throw myErr;
}
async function doB() {
  throw new Error("Error in doB");
}

async function main() {
  try {
    await doA();
    await doB();
  } catch (err) {
    if (err.code === "abc") {
      throw err; // handle in the caller
    }
  }
}

main()
  .then(() => {
    console.log("bom");
  })
  .catch((err) => console.log("caller, err:", err));
```
