const fs = require('fs/promises');
const path = require('path');

const srcDirName = 'files';
const srcDirPath = path.join(__dirname, srcDirName);
const destDirName = srcDirName + '-copy';
const destDirPath = path.join(__dirname, destDirName);

const copyDir = async (srcPath, destPath) => {
  try {
    await fs.access(destPath); // Check access to destination directory
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(destPath); // Create directory if it does not exist
    } else {
      console.log(`ERROR: ${error.message}`);
      process.exit();
    }
  }

  try {
    const distDir = await fs.opendir(destPath);
    const srcDir = await fs.opendir(srcPath);

    // remove files from destination directory
    for await (const destDirent of distDir) {
      const name = destDirent.name;
      await fs.rm(path.join(destPath, name));
    }

    // copy files from srcDirectory to destDirectory
    for await (const srcDirent of srcDir) {
      const name = srcDirent.name;
      if (srcDirent.isFile()) {
        await fs.copyFile(path.join(srcPath, name), path.join(destPath, name));
      } else {
        await copyDir(path.join(srcPath, name), path.join(destPath, name));
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

copyDir(srcDirPath, destDirPath)
  .then(() => {
    process.exit();
  });

module.exports = { copyDir };
