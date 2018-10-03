

require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.filter.uppercase = function(val){
    return (""+val).toUpperCase();
};