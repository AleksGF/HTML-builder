const fs = require('fs/promises');
const path = require('path');

const copyDir = async () => {
  const srcDirName = 'files';
  const srcDirPath = path.join(__dirname, srcDirName);
  const destDirName = srcDirName + '-copy';
  const destDirPath = path.join(__dirname, destDirName);

  try {
    await fs.access(destDirPath); // Check access to destination directory
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(destDirPath); // Create directory if it does not exist
    } else {
      console.log(`ERROR: ${error.message}`);
      process.exit();
    }
  }

  try {
    const distDir = await fs.opendir(destDirPath);
    const srcDir = await fs.opendir(srcDirPath);

    // remove files from destination directory
    for await (const destDirent of distDir) {
      if (destDirent.isFile()) {
        const fileName = destDirent.name;
        await fs.rm(path.join(destDirPath, fileName));
      }
    }

    // copy files from srcDirectory to destDirectory
    for await (const srcDirent of srcDir) {
      if (srcDirent.isFile()) {
        const fileName = srcDirent.name;
        await fs.copyFile(path.join(srcDirPath, fileName), path.join(destDirPath, fileName));
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

copyDir();
