
var isArray = require("../func/isArray.js");

module.exports = function(val) {

    if (!val) {
        return true;
    }

    if (isArray(val) && val.length === 0) {
        return true;
    }

    return false;
};