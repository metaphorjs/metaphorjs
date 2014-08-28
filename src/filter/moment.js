
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    dateFormats = require("../var/dateFormats.js");

nsAdd("filter.moment",  function(val, scope, format) {
    format  = dateFormats[format] || format;
    return moment(val).format(format);
});