

var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    numberFormats = require("../var/numberFormats.js");


nsAdd("filter.numeral",  function(val, scope, format) {
    format  = numberFormats[format] || format;
    return numeral(val).format(format);
});