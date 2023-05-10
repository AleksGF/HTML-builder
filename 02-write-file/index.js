const fs = require('fs/promises');
const path = require('path');

const main = async () => {
  try {
    const {stdin, stdout, exit} = process;
    const fd = await fs.open(path.join(__dirname, 'text.txt'), 'w');
    const output = fd.createWriteStream({encoding: 'utf8'});
    stdin.pipe(output);
    stdout.write('Enter something to be written to the file (type "exit" to finish):\n');
    stdin.on('data', (data) => {
      if (data.toString().toLowerCase().includes('exit')) exit(1);
      stdout.write('The message was written to the file. Do you want to add more (type "exit" to finish):\n');
    });
    process.on('exit', (code) => {
      let msg = '';

      switch (code) {
      case 0:
        msg = 'Thank you! Your message saved in file.';
        break;
      case 1:
        msg = 'EXIT as you wish';
        break;
      case 2:
        msg = 'You have aborted the process!';
      }

      stdout.write(msg);
    });

    process.on('SIGINT', () => {
      exit(2);
    });
  } catch (error) {
    console.log(error.message);
  }
};

main();
