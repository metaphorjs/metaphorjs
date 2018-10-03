
require("../../../dev/env.js");

var path = require("path");
var jsdom = require("jsdom");
var getFileList = require("metaphorjs-build/src/func/getFileList.js");

describe("Syntax check", function() {
    it("should be able to require all files in src/", function() {
        var files = getFileList(
            path.normalize(__dirname + "/../../../src/func") + "/**", "js");
        
        // mock window object
        global.window = jsdom.jsdom("").defaultView;
            
        files.forEach(function(filePath){
            require(filePath);
        });
    });
});



