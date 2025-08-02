https://nodejs.org/dist/v22.12.0/docs/api/assert.html
https://nodejs.org/dist/v22.12.0/docs/api/test.html

REFER TO # PRACTICE TEST ON PLAY NOTES

# Automated tests on Node.js

- Automated tests are the extremenly important for any application, if an application hasn't been automated tested it shouldn't be considered production ready.

## Assertions with `assert` module

- The core `assert` module exports a function that throws an AssertionError if the condition inside it is not met.
- If the value passed to `assert()` is a truthy value it will not throw.

  ```js
  const assert = require("assert");
  assert.strict.equal(10, 12);
  /*
  node:assert:128
  throw new AssertionError(obj);
    AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
    10 !== 12
  at Object.<anonymous> (/Users/godinhojoao/personal/jsnad-studies/index.js:11:15)
  */
  ```

- There are many assert methods within the core `assert` module.
- The non strict assertions (coercive ==) will be removed from node core, I'm mentioned they here because on node v22 it's still possible to use it.
- Use only strict assertions (===).
  - `assert.ok(val)` -> Asserts that val is truthy
  - `assert.equal(val1, val2)` -> Asserts val1 == val2 (coercive equality)
  - `assert.notEqual(val1, val2)` -> Asserts val1 != val2 (coercive inequality)
  - `assert.strictEqual(val1, val2)` -> Asserts val1 === val2 (strict equality)
    - this way we don't need to test `typeof field === 'number'`, because it will also check hte type
    - we could also do `assert.strict.equal(val1, val2)`
  - `assert.notStrictEqual(val1, val2)` -> Asserts val1 !== val2 (strict inequality)
  - `assert.deepEqual(obj1, obj2)` -> Asserts deep equality with coercion (==)
    - deep -> traverse object structures and performs equality checks on its primitive properties
  - `assert.deepStrictEqual(obj1, obj2)` -> Asserts deep strict equality (===)
  - `assert.notDeepEqual(obj1, obj2)` -> Asserts deep inequality with coercion
  - `assert.notDeepStrictEqual(obj1, obj2)`-> Asserts deep strict inequality
  - `assert.throws(fn)` -> Asserts that fn throws an error
  - `assert.doesNotThrow(fn)` -> Asserts that fn does not throw
  - `assert.rejects(promise)` -> Asserts that promise rejects
  - `assert.doesNotReject(promise)` -> Asserts that promise resolves
  - `assert.ifError(err)` -> Asserts that err is falsy (null or undefined)
  - `assert.match(string, regex)` -> Asserts string matches regex
  - `assert.doesNotMatch(string, regex)` -> Asserts string does not match regex
  - `assert.fail()` -> Always fails by throwing an AssertionError

### Error Handling Assertions

- Testing with `assert.throws(func, error)` and `assert.doesNotThrow(func)`

```js
const assert = require("assert");
const add = (a, b) => {
  if (typeof a !== "number" || typeof b !== "number") {
    throw Error("inputs must be numbers");
  }
  return a + b;
};
assert.throws(() => add("5", "5"), Error("inputs must be numbers"));
assert.doesNotThrow(() => add(5, 5));
```

- Testing with `assert.doesNotReject(func)` and `assert.rejects(func, error)`

```js
const assert = require("assert");
const { setTimeout: timeout } = require("timers/promises");
const fakeRequest = async (url) => {
  await timeout(300);
  if (url === "ht‌tps://error.com") throw Error("invalid url error");
  return Buffer.from("good");
};
assert.doesNotReject(fakeRequest("ht‌tps://example.com"));
assert.rejects(fakeRequest("ht‌tps://error.com"), Error("invalid url error"));
```

## Test Harness

- Is a framework or environment designed to facilitate the execution and management of automated tests.
- It typically includes:
  - `test runner`: Manages the execution of tests and determines pass/fail outcomes.
  - `test fixtures`: Setup and teardown processes to prepare the environment for tests.
  - `assertions`: Functions that compare expected outcomes with actual results.
  - `test reporting`: Collects and formats results, showing success or failure.
  - `mocking/stubbing`: Simulates external systems or components for isolated testing.
- We've some options that are **"all-inclusive" frameworks**: `jest`, `mocha`.
- A framework that is a **lightweight alternative**, `node-tap`.
- And Node.js also provides its own **built-in testing module**, `node:test`, for simple test cases without external dependencies.

## `node:test` Built-in Module

- Best option for simplicity with good environment and test reports. Built-in test lifecycle, grouping, and reporting.
  - We are using only `describe` and `test`, but it has many lifecycle functions and is **stable starting on Node.js v20**.
  - Some Lifecycle functions: `before`, `after`, `beforeEach`, `afterEach`.
- To run it: `node --test ./tests/*`

```javascript
// file: ./add.js
export function addFn(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw Error("inputs must be numbers");
  }
  return a + b;
}

// file: ./tests/add.test.js
import { addFn } from "../add.js";
import { describe, test } from "node:test";
import assert from "node:assert";

describe("addFn", () => {
  test("Given non-numeric inputs, it should throw an error", (t) => {
    assert.throws(() => addFn("5", "5"), /inputs must be numbers/);
    assert.throws(() => addFn(5, "5"), /inputs must be numbers/);
    assert.throws(() => addFn("5", 5), /inputs must be numbers/);
    assert.throws(() => addFn({}, null), /inputs must be numbers/);
    // Test passes because it does not throw an exception.
    // It would fail if one of these tests returned a falsy value in the assert().
  });

  test("Given two numbers it should adds them", (t) => {
    assert.strictEqual(addFn(2, 2), 4);
    assert.strictEqual(addFn(-2, 2), 0);
    assert.strictEqual(addFn(0, 2), 2);
  });
});
```

### Mocking with `node:test`

- We can do it using the `mock(fn)` exported from `node:test`
- We need to clean all mocks after in the end of the `test(fn)`.

```javascript
import assert from "node:assert";
import { mock, test } from "node:test";

// mocking with the exported function `mock(fn)`
test("spies on a function", () => {
  function sum(a, b) {
    return a + b;
  }

  const sumMock = mock.fn(sum);

  assert.strictEqual(sumMock.mock.callCount(), 0);
  assert.strictEqual(sumMock(3, 4), 7);
  assert.strictEqual(sumMock.mock.callCount(), 1);

  const call = sumMock.mock.calls[0];
  assert.deepStrictEqual(call.arguments, [3, 4]);
  assert.strictEqual(call.result, 7);
  assert.strictEqual(call.error, undefined);

  // Reset the globally tracked mocks.
  mock.reset();
});
```

- Or we can use the `TestContext` inside each `test(fn)`.
- It automatically clean the mocks when `test(fn)` finishes.

```javascript
import assert from "node:assert";
import { test } from "node:test";

test("spies on an object method", (t) => {
  const number = {
    value: 5,
    add(a) {
      return this.value + a;
    },
  };

  t.mock.method(number, "add");
  assert.strictEqual(number.add.mock.callCount(), 0);
  assert.strictEqual(number.add(3), 8);
  assert.strictEqual(number.add.mock.callCount(), 1);

  const call = number.add.mock.calls[0];

  assert.deepStrictEqual(call.arguments, [3]);
  assert.strictEqual(call.result, 8);
  assert.strictEqual(call.target, undefined);
  assert.strictEqual(call.this, number);
});
```

- **Obs**:
  - We can also **mock timers** and **dates** to avoid waiting for time to pass in order to test a specific function.
  - You can read more about this in the documentation at the top of this article.
