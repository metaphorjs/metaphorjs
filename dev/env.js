
/*

This script works in development environment, where all modules
are next to each other:

metaphorjs
metaphorjs-observable
metaphorjs-build
etc

So if some module requires metaphorjs-promise, it will be taken
from metaphorjs-promise/src/lib/Promise.js
but not from /node_modules/metaphorjs-promise.
*/

var path = require("path");

var parent = path.normalize(__dirname + "/../../");
var mjsRoot = parent.substring(0,parent.length-1);

if (module.paths.indexOf(mjsRoot) == -1) {
    module.paths.push(mjsRoot);
}

var prevPath = "" + (process.env.NODE_PATH||"");
if (prevPath) {
    prevPath += path.delimiter;
}
process.env.NODE_PATH = prevPath + mjsRoot;
require("module").Module._initPaths();
