const fs = require('fs/promises');
const path = require('path');

const copyDir = async () => {
  try {
    const srcDirPath = path.join(__dirname, 'files');
    const srcDir = await fs.opendir(srcDirPath);

    const destDirPath = await fs.mkdir('files-copy', { recursive: true });

    if (!destDirPath) throw new Error('Error: Directory exist!');

    for await (const dirent of srcDir) {
      const fileName = dirent.name;
      await fs.copyFile(path.join(srcDirPath, fileName), path.join(destDirPath, fileName));
    }
  } catch (error) {
    console.log(error.message);
  }
};

copyDir();
