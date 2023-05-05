const fs = require('fs/promises');
const path = require('path');

const templateName = 'template.html';
const templatePath = path.join(__dirname, templateName);
const componentsDirName = 'components';
const componentsDirPath = path.join(__dirname, componentsDirName);
const stylesDirName = 'styles';
const stylesDirPath = path.join(__dirname, stylesDirName);
const assetsDirName = 'assets';
const assetsSrcDirPath = path.join(__dirname, assetsDirName);
const destDirName = 'project-dist';
const destDirPath = path.join(__dirname, destDirName);
const destFileName = 'index.html';
const destFilePath = path.join(destDirPath, destFileName);
const destStylesFileName = 'style.css';
const destStyleFilePath = path.join(destDirPath, destStylesFileName);
const assetsDestDirPath = path.join(destDirPath, assetsDirName);

const components = [];

const getComponentsList = async (templatePath) => {
  const templateFH = await fs.open(templatePath, 'r');
  const template = await templateFH.readFile({ encoding: 'utf8' });
  await templateFH.close();

  const regexp = /{{(.*?)}}/g;

  return ({
    template,
    componentsFromTemplate: [...template.matchAll(regexp)].map((el) => el[1])
  });
};

const getComponent = async (component) => {
  const name = component;
  let body;

  try {
    const htmlFH = await fs.open(path.join(componentsDirPath, `${name}.html`), 'r');
    body = await htmlFH.readFile({encoding: 'utf8'});
    await htmlFH.close();
  } catch (error) {
    body = '';
    console.log(error.message);
  }

  return { name, body };
};

const makeEmptyDestDir = async (dir) => {
  try {
    await fs.access(dir); // Check access to destination directory
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dir); // Create directory if it does not exist
    } else {
      throw error;
    }
  }

  const destDir = await fs.opendir(dir);

  // remove all from destination directory
  for await (const destDirent of destDir) {
    const name = destDirent.name;

    if (destDirent.isFile()) {
      await fs.rm(path.join(dir, name));
    } else {
      await makeEmptyDestDir(path.join(dir, name));
      await fs.rmdir(path.join(dir, name));
    }
  }
};

const copyDir = async (srcPath, destPath) => {
  await makeEmptyDestDir(destPath);

  const srcDir = await fs.opendir(srcPath);

  for await (const srcDirent of srcDir) {
    const name = srcDirent.name;
    if (srcDirent.isFile()) {
      await fs.copyFile(path.join(srcPath, name), path.join(destPath, name));
    } else {
      await copyDir(path.join(srcPath, name), path.join(destPath, name));
    }
  }
};

const mergeComponents = async (template, components, destIndex) => {
  const regexp = /{{(.*?)}}/g;
  const htmlBody = template
    .replace(regexp, (match, componentName) => components.find((el) => el.name === componentName).body);

  const htmlFH = await fs.open(destIndex, 'w');
  await htmlFH.writeFile(htmlBody, { encoding: 'utf8'});
  await htmlFH.close();
};

const mergeStyles = async (srcDirPath, destFilePath) => {
  let styleBody = [];
  const srcDir = await fs.opendir(srcDirPath);

  for await (const dirent of srcDir) {
    const { name } = dirent;
    if (dirent.isFile() && path.extname(name) === '.css') {
      const fh = await fs.open(path.join(srcDirPath, name));
      const style = await fh.readFile({ encoding: 'utf8' });
      await fh.close();
      styleBody.push(style);
    }
  }

  const destFH = await fs.open(destFilePath, 'w');
  await destFH.writeFile(styleBody.join('\n'));
  await destFH.close();
};

const main = async () => {
  try {
    const { template, componentsFromTemplate } = await getComponentsList(templatePath);

    if (componentsFromTemplate.length === 0) throw new Error('No components found in template');

    for (const component of componentsFromTemplate) {
      const item = await getComponent(component);
      components.push(item);
    }

    await makeEmptyDestDir(destDirPath);

    await copyDir(assetsSrcDirPath, assetsDestDirPath);

    await mergeComponents(template, components, destFilePath, destStyleFilePath);

    await mergeStyles(stylesDirPath, destStyleFilePath);
  } catch (error) {
    console.log(error.message);
  }
};

main();
