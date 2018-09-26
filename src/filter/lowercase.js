

require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js");

MetaphorJs.filter.lowercase = function(val){
    return (""+val).toLowerCase();
};