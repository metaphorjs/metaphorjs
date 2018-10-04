
require("../../../dev/env.js");

var path = require("path");
var jsdom = require("jsdom");
var getFileList = require("metaphorjs-build/src/func/getFileList.js");

describe("Syntax check", function() {
    it("should be able to require all files in src/", function() {
        // mock window object
        global.window = jsdom.jsdom("").defaultView;

        ["func", "lib"].forEach(function(dir){
            getFileList(
                path.normalize(__dirname + "/../../../src/" + dir) + "/**", 
                "js"
            ).forEach(function(filePath){
                require(filePath);
            });
        });
    });
});



