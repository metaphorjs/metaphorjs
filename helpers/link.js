
const repos = require("./repos");
const { execSync } = require("child_process");

process.chdir(__dirname + "/../../");


repos.forEach(r => {
    process.chdir(r);
    console.log(process.cwd());
    console.log(`yarn link`);
    execSync("yarn link");
    process.chdir("../");
});


repos.forEach(r => {
    process.chdir(r);
    repos.forEach(peer => {
        if (peer !== r) {
            console.log(process.cwd());
            console.log(`yarn link ${peer}`);
            execSync(`yarn link ${peer}`);
        }
    });
    process.chdir("../");
});

