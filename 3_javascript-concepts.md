# JavaScript Concepts

## Data Types

- Javascript is a dynamic and loosely typed language, with 7 primitive types, everything else are objects (even functions and arrays).
- Objects have prototypes, which allow them to inherit built-in properties and methods. The prototype itself is also an object.
  - If an object does not have a specific property or method, it will retrieve it from its prototype.
  - **Null**: absence of object.
  - **Undefined**: absence of defined value.
  - **Number**: 1, 1.5, -1e4, NaN
  - **BigInt**: 1n, 9007199254740993n
  - **String**: 'str', "str", `str ${var}` -> different ways to create
  - **Boolean**: true, false
  - **Symbol**: Symbol('description'), Symbol.for('namespace')

## Functions

- In JavaScript, functions are first-class citizens, meaning they are treated like any other value (e.g., numbers, strings, objects). This allows functions to:
- Since functions are objects in JavaScript, they inherit the characteristics of objects, such as having properties and methods:
  ```javascript
  function test() {
    console.log("Hello");
  }
  test.myPropertyTest = 123;
  test(); // it will log Hello
  console.log(test); // [Function: test] { myPropertyTest: 123 }
  ```
- Functions can be used in many different ways:

  ```javascript
  // Assign functions to variables and objects
  const myFunc = () => {
    console.log("test");
  };
  const obj = { myMethod: myFunc };
  myFunc(); // print test
  obj.myMethod(); // print test

  // Pass functions as arguments:
  function higherOrderFunc1(fn) {
    fn();
  }
  higherOrderFunc1(myfunc); // print test

  // Return a function from another function
  function higherOrderFunc2() {
    return () => {
      return 10;
    };
  }
  const returnedfunc = higherOrderFunc2();
  console.log(returnedfunc()); // print 10
  ```

  ### Arrow Functions & This keyword

  - The `this` keyword refers to the context where the code is running. Typically used in object methods.
  - Arrow functions on JS doesn't have `this`.
  - Without object `this` and prototype:
    ```javascript
    const objArrow = {
      method: () => {
        console.log(this); // { } on Node.js or Window on browser
      },
    };
    objArrow.method();
    function normalFunction() {}
    const arrowFunc = () => {};
    console.log(typeof normalFunction.prototype); // 'object'
    console.log(typeof arrowFunc.prototype); // 'undefined'
    ```
  - With object `this` and prototype:
    ```javascript
    const objWithThis = {
      method: function () {
        console.log(this); // { method: [Function: method] }
      },
    };
    objWithThis.method();
    ```
  - `this` depends where its being called not where it's defined:
    ```javascript
    const objInnerThisTest = {
      method: () => {
        function inner() {
          console.log(this); // global on Node.js or Window on browser
        }
        return inner;
      },
    };
    const inner = objInnerThisTest.method();
    const obj2 = { name: "abc", inner };
    inner(); // global on Node.js or Window on browser
    obj2.inner(); // { name: 'abc', inner: [Function: inner] }
    ```

## Prototypal Inheritance

### Functional

```javascript
const animal = {
  makeSound: () => {
    console.log("animal sound");
  },
};
const lion = Object.create(animal, {
  roar: {
    value: () => {
      console.log("roar!!");
    },
  },
});
function createCat(name) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
  return Object.create(lion, { name: { value: name } });
}
const meowThecat = createCat("meow The cat");
console.log(meowThecat.name); // meow The cat
meowThecat.makeSound(); // animal sound (it finds the makesound method in the prototype chain)
meowThecat.roar(); // roar!!
console.log(Object.getPrototypeOf(lion) === animal); // true
console.log(Object.getPrototypeOf(meowThecat) === lion); // true
console.log(Object.getPrototypeOf(meowThecat) === animal); // false, because lion is the prototype of meowThecat not animal
```

### Class-Syntax Constructors (syntax sugar)

- Syntax sugar is shorthand that makes code more readable without changing functionality.

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  makeSound() {
    console.log("animal sound");
  }
}

class Lion extends Animal {
  roar() {
    console.log("roar!!");
  }
}

// We can't "extends" from more than one class, and we don't need since we have prototype chain to use animal methods
class Cat extends Lion {
  meow() {
    console.log("meow!!");
  }
}

const thecat = new Cat("the cat");
// prototype chain: thecat -> Cat.prototype -> Lion.prototype -> Animal.prototype -> Object.prototype.

console.log("thecat.name", thecat.name); // the cat
thecat.makeSound(); // animal sound (using Animal method because of prototype chain)
thecat.roar(); // roar!!
thecat.meow(); // meow!!
Object.getPrototypeOf(thecat) === Cat.prototype; // true
Object.getPrototypeOf(Cat.prototype) === Lion.prototype; //true
Object.getPrototypeOf(Lion.prototype) === Animal.prototype; // true
Object.getPrototypeOf(Cat) === Lion.prototype; // false because Cat is a function and not an object extended from Lion
```

Let's take a look at the Wolf class:
```javascript
class Wolf {
  constructor (name) {
    this.name = name
  }
  howl () { console.log(this.name + ': awoooooooo') }
}

This is desugared to:

function Wolf (name) {
  this.name = name
}

Wolf.prototype.howl = function () {
 console.log(this.name + ': awoooooooo')
}
```

## Closure Scope

- Functions have a scope, meaning the variables created within a function are accessible locally and not outside of it.

```javascript
function fn() {
  var test = 10; // Avoid using var, as it allows you to redeclare the same variable in the same scope without a syntax error.
  let test3 = 2; // Redeclaring a variable with let in the same scope will throw an error: "SyntaxError: Identifier 'test3' has already been declared."
  const test2 = 2;
}
fn();
console.log("test", test); // undefined
console.log("test2", test2); // undefined
console.log("test3", test3); // undefined

// it returns an error "ReferenceError: test is not defined"
```

- Functions within another functions can access the scope of the outer function
- If there is a naming collision then the reference to the nearest closure scope takes precedence
  ```javascript
  function outerFunc() {
    let foo = true;
    function printFoo() {
      console.log(foo);
    }
    printFoo(); // true
    foo = false;
    printFoo(); // false
  }
  outerFunc();
  ```
- It can be used on `Higher Order functions` to create a encapsulate a private state.

  ```javascript
  function initObjectConstructor(objectDescription) {
    let identifier = 0; // this remains in the closure, but can't be changed out
    return (name) => {
      identifier += 1;
      return { identifier, objectDescription, name };
    };
  }
  const createUserFunc = initObjectConstructor("an user object"); // here we have a private state on the closure
  const joao = createUserFunc("joao");
  const john = createUserFunc("john");
  console.log(joao); // { identifier: 1, objectDescription: 'an user object', name: 'joao' }
  console.log(john); // { identifier: 2, objectDescription: 'an user object', name: 'john' }

  const createUserFunc2 = initObjectConstructor("another object"); // here we have another private state
  const joao2 = createUserFunc2("joao");
  console.log(joao2); // { identifier: 1, objectDescription: 'another object', name: 'joao' }
  ```
