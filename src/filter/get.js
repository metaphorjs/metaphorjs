
require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js"),
    undf = require("../var/undf.js");

MetaphorJs.filter.get = function(val, scope, prop) {
    var tmp = (""+prop).split("."),
        key;

    while (key = tmp.shift()) {
        val = val[key];
        if (val == undf) {
            return undf;
        }
    }

    return val;
};

