let sum = 0;
const START_OF_ARGS_INDEX = 2

for (let i = START_OF_ARGS_INDEX; i < process.argv.length; i++) {
  sum += Number(process.argv[i]);
}
console.log(sum)