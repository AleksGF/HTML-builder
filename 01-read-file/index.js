const fs = require('fs/promises');
const path = require('path');

const main = async () => {
  try {
    const fd = await fs.open(path.join(__dirname, 'text.txt'), 'r');
    const readStream = fd.createReadStream({encoding: 'utf-8'});
    readStream.pipe(process.stdout);
    readStream.on('end', () => {process.exit();});
    readStream.on('error', (error) => {process.stdout.write(`Error: ${error.message}`);});
  } catch (error) {
    console.log(error);
  }
};

main();
