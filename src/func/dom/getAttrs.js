
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get node attributes as plain object
 * @function MetaphorJs.dom.getAttrs
 * @param {Node} node
 * @returns {object}
 */
module.exports = MetaphorJs.dom.getAttrs = function(node) {
    var attrs = node.attributes,
        map = {},
        i, l;

    for (i = 0, l = attrs.length; i < l; i++) {
        map[attrs[i].name] = attrs[i].value;
    }

    return map;
};