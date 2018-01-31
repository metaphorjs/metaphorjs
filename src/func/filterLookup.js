
var nsGet = require("metaphorjs-namespace/src/func/nsGet.js");

module.exports = function(name) {
    return nsGet("filter." + name, true);
};