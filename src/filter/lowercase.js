

require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.filter.lowercase = function(val){
    return (""+val).toLowerCase();
};