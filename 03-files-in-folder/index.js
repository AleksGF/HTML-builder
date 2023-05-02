const fs = require('fs/promises');
const path = require('path');

const main = async () => {
  try {
    const dirPath = path.join(__dirname, 'secret-folder');
    const dir = await fs.opendir(dirPath);
    for await (const dirent of dir) {
      if (dirent.isFile()) {
        const fileName = dirent.name;
        const fileExt = path.extname(fileName);
        const fileBasename = path.basename(fileName, fileExt);

        const fd = await fs.open(path.join(dirPath, fileName), 'r');
        const stats = await fd.stat();
        const size = stats.size;

        console.log(`${fileBasename} - ${fileExt.replace('.', '')} - ${size} byte`);

        await fd?.close();
      }
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    process.exit();
  }
};

main();
