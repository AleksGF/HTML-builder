const fs = require('fs/promises');
const path = require('path');

const main = async () => {
  const srcDirName = 'styles';
  const srcDirPath = path.join(__dirname, srcDirName);
  const distDirName = 'project-dist';
  const distFileName = 'bundle.css';
  const distFilePath = path.join(__dirname, distDirName, distFileName);

  try {
    const fh = await fs.open(distFilePath, 'w');
    const writable = fh.createWriteStream({ encoding: 'utf8' });
    const srcDir = await fs.opendir(srcDirPath);

    for await (const srcDirEnt of srcDir) {
      if (srcDirEnt.isFile() && path.extname(srcDirEnt.name) === '.css') {
        const fh = await fs.open(path.join(srcDirPath, srcDirEnt.name), 'r');
        const readable = fh.createReadStream({ encoding: 'utf8' });

        readable.pipe(writable, { end: false });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

main();
