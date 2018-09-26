

require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js"),
    numberFormats = require("../var/numberFormats.js");


MetaphorJs.filter.numeral = function(val, scope, format) {
    format  = numberFormats[format] || format;
    return numeral(val).format(format);
};