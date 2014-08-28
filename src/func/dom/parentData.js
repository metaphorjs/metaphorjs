
var data = require("./data.js");

module.exports = function(node, key) {

    var val;

    while (node) {
        val = data(node ,key);
        if (val != undefined) {
            return val;
        }
        node  = node.parentNode;
    }

    return undefined;
};