
var varType = require("./varType.js");

module.exports = function(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
};