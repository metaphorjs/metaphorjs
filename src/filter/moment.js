
require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js"),
    dateFormats = require("../var/dateFormats.js");

MetaphorJs.filter.moment = function(val, scope, format) {
    format  = dateFormats[format] || format;
    return val ? moment(val).format(format) : "";
};