
var getElemRect = require("./getElemRect.js");

module.exports = function(el) {
    return getElemRect(el).width;
};