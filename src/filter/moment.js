
require("./__init.js");
require("metaphorjs-shared/src/lib/Cache.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.filter.moment = function(val, scope, format) {
    return val ? moment(val).format(
        MetaphorJs.lib.Cache.global().get(format, format)
    ) : "";
};