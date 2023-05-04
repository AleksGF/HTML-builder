const fs = require('fs/promises');
const path = require('path');

const mergeStyles = async function(src, dest) {
  let isFirstTime = false;

  if (!this.beenAvoid) {
    isFirstTime = true;
    this.beenAvoid = true;
  }

  try {
    const srcFH = await fs.open(src, 'r');
    const readable = srcFH.createReadStream({ encoding: 'utf8' });

    const destFH = await fs.open(dest, 'a');
    const writable = destFH.createWriteStream({ encoding: 'utf8' });
    const stat = await destFH.stat();
    const separator = isFirstTime && stat.size === 0 ? '' : '\n';

    const chunks = [];

    readable.on('readable', () => {
      let chunk;

      while (null !== (chunk = readable.read())) {
        chunks.push(chunk);
      }
    });

    readable.on('end', () => {
      writable.write(separator + chunks.join(''));
    });
  } catch (error) {
    console.log(error.message);
  }
};

const srcDirName = 'styles';
const srcDirPath = path.join(__dirname, srcDirName);
const destDirName = 'project-dist';
const destFileName = 'bundle.css';
const destFilePath = path.join(__dirname, destDirName, destFileName);

const main = async (srcDir, destPath) => {
  try {
    const dir = await fs.opendir(srcDir);
    const fh = await fs.open(destPath, 'w');
    await fh.close();

    for await (const dirEnt of dir) {
      const name = dirEnt.name;

      if (dirEnt.isFile() && path.extname(name) === '.css') {
        const srcFilePath = path.join(srcDir, name);
        await mergeStyles(srcFilePath, destPath);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

main(srcDirPath, destFilePath);

exports.module = { mergeStyles };
