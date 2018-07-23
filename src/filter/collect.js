
var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js"),
    undf = require("../var/undf.js");

nsAdd("filter.collect", function(input, scope, prop) {

    var res = [],
        i, l, val;

    if (!input) {
        return res;
    }

    for (i = 0, l = input.length; i < l; i++) {
        val = input[i][prop];
        if (val != undf) {
            res.push(val);
        }
    }

    return res;
});