

require("./__init.js");
require("metaphorjs-shared/src/lib/Cache.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.filter.numeral = function(val, scope, format) {
    return numeral(val).format(
        MetaphorJs.lib.Cache.global().get(format, format)
    );
};