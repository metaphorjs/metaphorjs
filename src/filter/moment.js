
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    dateFormats = require("../var/dateFormats.js");

nsAdd("filter.moment",  function(val, scope, format) {
    format  = dateFormats[format] || format;
    return val ? moment(val).format(format) : "";
});