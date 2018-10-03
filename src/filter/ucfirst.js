
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.filter.ucfirst = function(val){
    return val.substr(0, 1).toUpperCase() + val.substr(1);
};