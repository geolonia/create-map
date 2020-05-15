const path = require("path");
const fs = require("fs").promises;
const ejs = require("ejs");
const pkgDir = require("pkg-dir");

/**
 *
 * @param {string} dir
 */
const listTemplateFiles = async (dir, templateFiles = []) => {
  const names = await fs.readdir(dir);
  for (const name of names) {
    const path = `${dir}/${name}`;
    const stat = await fs.lstat(path);
    if (stat.isFile()) {
      templateFiles.push({ dir, name });
    } else if (stat.isDirectory()) {
      await listTemplateFiles(path, templateFiles);
    }
  }
  return templateFiles;
};

/**
 *
 * @param {string} dir
 * @param {string} name
 * @return {string}
 */
const createGeoloniaMap = async (dir, name, options) => {
  const templateDir = `${await pkgDir()}/templates/${options.template}`;
  if (!options.template) {
    throw new Error(`${options.template} is not valid Geolonia template name.`);
  }
  const templateExists = !!(await fs
    .readdir(templateDir)
    .then(() => true)
    .catch(() => false));

  if (!templateExists) {
    throw new Error(`${options.template} is not valid Geolonia template name.`);
  }
  const destDir = path.resolve(dir, name);
  const templateFiles = await listTemplateFiles(templateDir);

  for (const { dir, name } of templateFiles) {
    const relativePart = path.relative(templateDir, dir);
    await fs.mkdir(`${destDir}/${relativePart}`, { recursive: true });

    ejs.renderFile(`${dir}/${name}`, { name }, (err, str) => {
      if (err) {
        throw err;
      } else {
        fs.writeFile(
          `${destDir}/${relativePart}/${name.replace(".ejs", "")}`,
          str
        );
      }
    });
  }

  return destDir;
};

module.exports = createGeoloniaMap;
