
var varType = require("./varType.js");

module.exports = function(value) {
    var vt = varType(value);
    return value !== null && typeof value == "object" && (vt > 2 || vt == -1);
};