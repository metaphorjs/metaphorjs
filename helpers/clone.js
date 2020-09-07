
const repos = require("./repos");
const { execSync } = require('child_process');

repos.forEach(r => {
    execSync(`git clone https://github.com/metaphorjs/${r}.git`)
});