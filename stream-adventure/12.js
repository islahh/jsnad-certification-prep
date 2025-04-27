import trumpet from 'trumpet';
import { Transform } from 'node:stream'

const tr = trumpet();
const loudStream = tr.select('.loud').createStream();

const upperCaseTransform = new Transform({
  transform(chunk, econding, next) {
    next(null, chunk.toString().toUpperCase());
  },
});
loudStream.pipe(upperCaseTransform).pipe(loudStream);

process.stdin.pipe(tr).pipe(process.stdout);
