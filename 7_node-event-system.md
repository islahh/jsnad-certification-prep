https://nodejs.org/api/events.html

# Event system

- Most of the **Node.js Core API** is built around an asynchronous **event-driven architecture** with objects called `emitters` can emit events to `Function` objects (`listeners`) to be called.
- The `EventEmitter` constructor in the events module is the functional backbone of many Node core API's.
  - All objects that emit events are instances of the EventEmitter class.
  - When the `EventEmitter` object emits an event, **all of the functions attached to that specific event are called synchronously**. Any values returned by the called listeners are ignored and discarded.
- `HTTP` and `TCP` servers are an **event emitter**, a `TCP socket` is an **event emitter**, `HTTP request and response` objects are **event emitters**.

## Creating an Event Emitter & Emitting events & Listening for Events

```javascript
import EventEmitter from "events";

// const myEmitter = new EventEmitter();

// More typical usage, by inherit from it:
class OrderEvents extends EventEmitter {
  constructor(options = {}) {
    super(options);
    this.name = options.name;
  }
}
const orderEvents = new OrderEvents({ name: "orderEvents" });
console.log("orderEvents", orderEvents);

// listen to events
orderEvents.on("orderFinished", function (data) {
  // eventEmitter.on(eventName, listener)
  console.log("orderFinished occurred!");
  console.log("data", data);
  console.log("this", this); // don't work for arrow functions as arrow functions don't have it's won "this" object
  /*
  this OrderEvents {
    _events: [Object: null prototype] { orderFinished: [Function (anonymous)] },
    _eventsCount: 1,
    _maxListeners: undefined,
    name: 'orderEvents',
    [Symbol(shapeMode)]: false,
    [Symbol(kCapture)]: false
  }
  */
});

// emitting events (events are called in the order they are emitted)
orderEvents.emit("orderFinished", { id: 1, price: 100 }); // eventEmitter.emit(eventName, ...args)
```

## Removing Listeners

```javascript
import EventEmitter from "events";

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

function listenerFunction() {
  console.log("event fired");
}
myEmitter.on("ev-test", listenerFunction);
myEmitter.emit("ev-test"); // prints event fired

// To remove a listener, you must pass the exact same function reference (this)
myEmitter.removeListener("ev-test", listenerFunction);

myEmitter.emit("ev-test"); // ignored, listener is removed
```

## Single Use Listener

- An event can be emitted more than once. But sometimes we want an event to be called only once.
- `eventEmitter.once`: register a listener that is called once for a particular event name.
  - After the event is emitted, the listener is unregistered and then called.
  - 1. register the listener "event-test" `.once`
  - 2. emit event to the listener (`.emit`)
  - 3. unregister the listener **before calling it's function** (`.removeListener`)
  - 4. call the listener function

```javascript
import EventEmitter from "events";

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

myEmitter.once("event-test", (n) => console.log(`event: ${n}`)); // add a once listener (unregistered after 1 event is emitted)
myEmitter.emit("event-test", 1); // prints event: 1
myEmitter.emit("event-test", 2); // ignored
```

## The error Event

- Emitting an error on an event emitter will cause the event emitter to throw an exception if a listener for the `error event` has not been registered. It will crash your application and give you an error stack trace.

```javascript
import { EventEmitter } from "events";
const myEventEmitter = new EventEmitter();

// if you comment this listener to error event it would crash your app:
myEventEmitter.on("error", (err) => {
  console.log("got error:", err.message);
});

myEventEmitter.emit("error", new Error("ops"));
```

## Promise-Based Single Use Listener and AbortController

- `Once` is an async func in which we can use Top Level await to await it finish before proceeding with the code.
- If it never fires, exeuction will never proceed past that point. (it can be something bad)
- To fix that we can set a timeout with 500ms to abort if the event not fires until the end of this time.
  - To `abort` the promisified `event listener` we can use an `AbortController` with its `signal`.

```javascript
import { once, EventEmitter } from "events";
import { setTimeout } from "timers/promises";

const uneventful = new EventEmitter();

const ac = new AbortController();
const { signal } = ac;

// if it take longer than the acceptable for the event to emit we abort this listener and proceed with the code.
setTimeout(500).then(() => ac.abort());

try {
  await once(uneventful, "ping", { signal });
  console.log("pinged!");
} catch (err) {
  // ignore abort errors:
  if (err.code !== "ABORT_ERR") throw err;
  console.log("canceled");
}
```
