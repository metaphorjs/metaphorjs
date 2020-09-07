const repos = require("./repos");
const { execSync } = require("child_process");


repos.forEach(r => {
    console.log(`yarn link ${r}`);
    execSync(`yarn link ${r}`);
});
