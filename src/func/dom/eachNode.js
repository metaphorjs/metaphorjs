require("./__init.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Walk dom tree
 * @function MetaphorJs.dom.eachNode
 * @param {DomNode} el
 * @param {function} fn {
 *  @param {DomNode} el
 * }
 * @param {object} context fn's context
 */
module.exports = MetaphorJs.dom.eachNode = function dom_eachNode(el, fn, context) {
    var i, len,
        children = el.childNodes;

    if (fn.call(context, el) !== false) {
        for(i =- 1, len = children.length>>>0;
            ++i !== len;
            dom_eachNode(children[i], fn, context)){}
    }
};
