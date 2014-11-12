
/*

This script works in development environment, where all modules
are next to each other:

/metaphorjs
/metaphorjs-observable
/metaphorjs-build
etc

So if some module requires metaphorjs-promise, it will be taken
from /metaphorjs-promise/src/dist/metaphorjs.promise.npm.js
but not from /node_modules/metaphorjs-promise.

This script reads package.json file in order to set the right
order of dependencies.

 */

var mockery = require("mockery"),
    fs = require("fs"),
    path = require("path");

mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false
});


//bin = dir + "/dist/" + name.replace('-', '.') + ".npm.js";
var parent = path.normalize(__dirname + "/../../");

var modules = [];
var mocked = {};

fs.readdirSync(parent)
    .forEach(function(name){
        var dir = parent + "/" + name;
        if (fs.lstatSync(dir).isDirectory() &&
            name.indexOf("metaphorjs") === 0) {
            modules.push(name);
        }
    });

var resolveDeps = function(pkg) {

    var k;

    if (pkg.dependencies) {
        for (k in pkg.dependencies) {
            if (k.indexOf("metaphorjs") === 0 && !mocked[k]) {
                mockModule(k);
            }
        }
    }
};

var mockModule = function(name) {

    if (mocked[name]) {
        return;
    }

    var dir     = parent +'/'+ name,
        pkg     = dir + '/package.json',
        main;

    if (!fs.existsSync(pkg)) {
        return;
    }

    pkg = require(pkg);

    if (!pkg.main) {
        return;
    }

    resolveDeps(pkg);

    main    = dir +'/' + pkg.main;

    if (fs.existsSync(main)) {
        mockery.registerMock(name, require(main));
    }

    mocked[name] = true;
};

modules.forEach(mockModule);