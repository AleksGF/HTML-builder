const fs = require('fs/promises');
const path = require('path');

const main = async () => {
  const { stdin, stdout, exit } = process;
  const fd = await fs.open(path.join(__dirname, 'text.txt'), 'w');
  const output = fd.createWriteStream({ encoding: 'utf8' });
  stdin.pipe(output);
  stdout.write('Enter something to be written to the file:\n');
  stdin.on('data', () => {
    exit();
  });
};

main();
