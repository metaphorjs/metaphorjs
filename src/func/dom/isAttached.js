
var elHtml = require("../../var/elHtml.js");

module.exports = function(){
    var isAttached = function(node) {
        if (node === window) {
            return true;
        }
        if (node.nodeType == 3) {
            if (node.parentElement) {
                return isAttached(node.parentElement);
            }
            else {
                return true;
            }
        }
        return node === elHtml ? true : elHtml.contains(node);
    };
    return isAttached;
}();