
require("../../app/Directive.js");

var returnFalse = require("metaphorjs-shared/src/func/returnFalse.js"), 
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.app.Directive.registerAttribute("app", 100, returnFalse);