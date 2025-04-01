https://nodejs.org/docs/latest-v22.x/api/buffer.html
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays
https://nodejs.org/docs/latest-v22.x/api/string_decoder.html

# Buffers

- In NodeJS we use the `Buffer` constructor to handle binary data.
- When the enconding isn't set, reading from the file system, or network socket, or any type of I/O will return an array-like instance that inherit from the `Buffer` constructor.
- This chapter we will discuss how to handle binary data.

## The Buffer Instance

- This is a global module, so you don't need to import anyhting to use it.
  - `node -e "console.log(Buffer)"`
    ```Javascript
    /*
    [Function: Buffer] {
      poolSize: 8192,
      from: [Function: from],
      copyBytesFrom: [Function: copyBytesFrom],
      of: [Function: of],
      alloc: [Function: alloc],
      allocUnsafe: [Function: allocUnsafe],
      allocUnsafeSlow: [Function: allocUnsafeSlow],
      isBuffer: [Function: isBuffer],
      compare: [Function: compare],
      isEncoding: [Function: isEncoding],
      concat: [Function: concat],
      byteLength: [Function: byteLength],
      [Symbol(kIsEncodingSymbol)]: [Function: isEncoding]
    }
    */
    ```
- When the `Buffer` was introduced to NodeJS the Javascript language did not have a native binary type.
- But with the advance of the language `ArrayBuffer` and more types were introduced to provide different `views` of a buffer.
- The `Buffer` constructor was refactored to use `Uint8Array` when these data structures were added to JavaScript.
  - So a Buffer is both an instance of `Buffer` and of `Uint8Array`
  ```javascript
  const buffer = Buffer.alloc(10);
  console.log(buffer instanceof Buffer); // true
  console.log(buffer instanceof Uint8Array); // true
  ```

## Allocating Buffers

- `Buffer.alloc(bytes)`: Allocates and Initializes memory with zeros, ensuring no leftover data, making it safer.
- `Buffer.allocUnsafe(bytes)`: Allocates memory without initializing it, making it faster but potentially unsafe.

```js
// Use mainly Buffer.alloc and avoid allocUnsafe or "new constructor"
const myBuffer = Buffer.alloc(10); // alloc 10 bytes
myBuffer[0] = 100; // 64 in hex
console.log(myBuffer); // <Buffer 64 00 00 00 00 00 00 00 00 00>
```

## Converting Strings to Buffers

- ```javascript
  // Using UTF8 encoding by default
  const aBufferUTF8 = Buffer.from("A");
  console.log(aBufferUTF8); // <Buffer 41>

  // Choosing UTF16 encoding
  const aBufferUTF16le = Buffer.from("A", "utf16le");
  console.log(aBufferUTF16le); // <Buffer 41 00>

  // We can also use base64 or hex encodings
  const aBufferBase64 = Buffer.from("QQ==", "base64");
  console.log(aBufferBase64); // <Buffer 41>

  console.log(aBufferUTF8.toString()); // A
  console.log(aBufferUTF16le.toString()); // A
  console.log(aBufferBase64.toString()); // A
  ```

## Converting Buffers to Strings

- ```javascript
  console.log(aBufferUTF8.toString("utf8")); // A
  console.log(aBufferUTF8.toString("hex")); // 41
  console.log(aBufferUTF8.toString("base64")); // QQ==
  ```

## Concatenating Buffers

```javascript
const buffer1 = Buffer.from("Hello", "utf8"); // UTF-8 buffer
const buffer2 = Buffer.from("SGVsbG8=", "base64"); // Base64 buffer
const buffer3 = Buffer.from("48656c6c6f", "hex"); // Hex buffer

const combinedBuffer = Buffer.concat([buffer1, buffer2, buffer3]);
console.log(combinedBuffer.toString("utf8")); // HelloHelloHello
```

## String_decoder

- Used to decode multi-byte characters. Good if you are reading streamed data in separated chunks and want to avoid broken characters.
- Keeps incomplete characters buffered until they are fully received.

```javascript
// Without string_decoder
// - reading multi-byte characters (they were read as corrupted characters)
const chunks = [
  Buffer.from([0x48, 0x65, 0x6c]), // "Hel"
  Buffer.from([0x6c, 0x6f, 0x20]), // "lo "
  Buffer.from([0xf0, 0x9f, 0x98]), // INCOMPLETE emoji (3 bytes) �
  Buffer.from([0x8a, 0x0a]), // Remaining part of emoji �
];

chunks.forEach((chunk) => {
  console.log("Raw Chunk:", chunk);
  console.log("Decoded Output:", chunk.toString("utf8")); // Might break multi-byte characters and show: �
});

// With string_decoder
const { StringDecoder } = require("node:string_decoder");
const decoder = new StringDecoder("utf8");
chunks.forEach((chunk) => {
  console.log("Raw Chunk:", chunk);
  console.log("Decoded Output:", decoder.write(chunk)); // Ensures complete characters
});
```

## JSON Serializing and Deserializing Buffers

- **Serialization** converts objects into a storable/transmittable format.
- **Deserialization** restores serialized data back to its original form.
- With **Buffer**, we can handle raw binary data and other data formats, converting it between text and more formats.
  - Important when dealing with non-text data: images, files, audio and binary data.
- `Buffer.toJSON`: this method allows us to use both `myBuffer.toJSON()` and `JSON.stringify(myBuffer)`.
  - When `JSON.stringify()` is called on a buffer, **it automatically calls Buffer.toJSON()** to convert it into a **JSON-friendly format**.

```javascript
const myBuffer = Buffer.from("🌍");
const json = JSON.stringify(myBuffer);
const parsed = JSON.parse(json);
console.log(parsed); // prints { type: 'Buffer', data: [ 240, 159, 140, 137 ] }
console.log(Buffer.from(parsed.data)); // prints <Buffer f0 9f 8c 8d>
console.log(Buffer.from(parsed.data).toString()); // prints 🌍
```
