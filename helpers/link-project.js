const repos = require("./repos");
const { execSync } = require("child_process");

const main = () => {
    repos.forEach(r => {
        console.log(`yarn link ${r}`);
        execSync(`yarn link ${r}`);
    });
}

if (require.main === module) {
    main();
}
else {
    module.exports = main;
}