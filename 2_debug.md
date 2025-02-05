# Debug and Profile

## Inspect Mode and Debugging with Chrome Inspect

- To debug Nodejs first you need to run your code on inspect mode, then you are able to connect the exposed remote protocol of inspect mode with a debugger (e.g. Chrome DevTools chrome://inspect).

## To start your code on inspect mode:

- Runs the code immediately: `node --inspect index.js`
- Stops the execution on the first line: `node --inspect-brk index.js`
  - Useful to debug from the start; Sometimes we first need to connect the debugger, so we need this break.
- `Node inspect` exposes a WebSocket server and it is used for communication between the Node.js runtime and debugging clients like Chrome DevTools.

  - Exposed by default by Node inspector: ws://127.0.0.1:9229/

  ### Connecting on Chrome DevTools

  - On your chrome open: `chrome://inspect`
  - Find your process on `RemoteTargets`
  - Click on `inspect`
  - Check if the `source` tab on Chrome DevTools is opened
  - Good now you can check the panels with
    - `Scope`: Variables accessible at the current execution context. (local variables, functions, and global variables)
    - `Global`: All varialbes, functions, and objects that are accessible anywhere in the Javascript execution context.
    - `Call stack`: The sequence of function calls leading to the current execution point. Good to track the origin of function calls.
    - `Watch`: Allows us to manually track variables values.
    - And more, e.g. network, console, etc...

## How to add a breakpoint?

- You can do that on VsCode UI clicking on the right side of the line, same on Chrome DevTools source tab.
- Or in code using `debugger`:
  ```javascript
  for (let i = 0; i < 10; i++) {
    console.log("i: ", i);
    debugger;
  }
  ```

## References:

- To learn more about [Debugging Node](https://nodejs.org/en/learn/getting-started/debugging)
- To learn more about [Chrome DevTools](https://developer.chrome.com/docs/devtools/overview)
