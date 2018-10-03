

require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js")
    undf = require("metaphorjs-shared/src/var/undf.js"),
    getRegExp = require("metaphorjs-shared/src/func/getRegExp.js");

MetaphorJs.filter.split = function(input, scope, sep, limit) {

    limit       = limit || undf;
    sep         = sep || "/\\n|,/";

    if (!input) {
        return [];
    }

    input       = "" + input;

    if (sep.substr(0,1) == '/' && sep.substr(sep.length - 1) == "/") {
        sep = getRegExp(sep.substring(1, sep.length-1));
    }

    var list = input.split(sep, limit),
        i, l;

    for (i = -1, l = list.length; ++i < l; list[i] = list[i].trim()){}

    return list;
};
