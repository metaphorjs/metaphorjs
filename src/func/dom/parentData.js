
var data = require("./data.js"),
    undf = require("../../var/undf.js");

module.exports = function(node, key) {

    var val;

    while (node) {
        val = data(node ,key);
        if (val !== undf) {
            return val;
        }
        node  = node.parentNode;
    }

    return undf;
};