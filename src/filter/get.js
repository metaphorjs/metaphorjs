
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    undf = require("../var/undf.js");

nsAdd("filter.get", function(val, scope, prop) {
    var tmp = (""+prop).split("."),
        key;

    while (key = tmp.shift()) {
        val = val[key];
        if (val == undf) {
            return undf;
        }
    }

    return val;
});

