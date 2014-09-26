
var path = require("path"),
    fs = require("fs"),
    isFile = require("./isFile.js"),
    isDir = require("./isDir.js");

module.exports = function(directory) {

    var fileList,
        dir,
        filePath,
        levels = 0,
        files = [];

    if (directory.substr(directory.length - 1) == "*") {
        levels++;
    }
    if (directory.substr(directory.length - 2) == "**") {
        levels++;
    }

    if (levels) {
        directory = directory.substr(0, directory.length - (levels + 1));
    }
    directory = path.normalize(directory);

    var readDir = function(dir) {
        fileList    = fs.readdirSync(dir);

        fileList.forEach(function(filename) {
            filePath = path.normalize(dir + "/" + filename);
            if (isFile(filePath) && path.extname(filePath) == ".js") {
                files.push(filePath);
            }
            else if (isDir(filePath) && levels > 1) {
                readDir(filePath);
            }
        });
    };


    if (levels > 0 || isDir(directory)) {
        readDir(directory);
    }
    else {
        files    = [directory];
    }

    return files;
};