const { execSync } = require('child_process');
const fs = require("fs")
const path = require("path");
const process = require('process');
const linkProject = require("./link-project.js");

/**
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function (childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

const setPackageName = (path, name) => {
    let content = fs.readFileSync(path).toString();
    content = content.replace('{{ name }}', name);
    fs.writeFileSync(path, content);
};

const main = (name) => {

    const targetDir = process.cwd() + "/" + name;
    const tplDir = path.resolve(__dirname, "template");

    if (fs.existsSync(targetDir)) {
        console.error(`Directory ${ name } already exists`);
        process.exit();
    }

    copyRecursiveSync(tplDir, targetDir);
    setPackageName(targetDir + '/package.json', name);

    process.chdir(targetDir);
    linkProject();
    execSync("yarn install");
}

main(process.argv[2]);