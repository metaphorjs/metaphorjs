

require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js");

MetaphorJs.filter.uppercase = function(val){
    return (""+val).toUpperCase();
};