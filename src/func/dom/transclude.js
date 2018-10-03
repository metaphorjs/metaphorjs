
require("./__init.js");
require("./data.js");
require("./toFragment.js");
require("./clone.js");
require("metaphorjs-shared/src/func/toArray.js");

var toArray = require("metaphorjs-shared/src/func/toArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.transclude = function dom_transclude(node, replace) {

    var parent = node.parentNode;
    while (parent) {
        contents = MetaphorJs.dom.data(node, 'mjs-transclude');
        if (contents !== undf) {
            break;
        }
        parent  = parent.parentNode;
    }

    if (contents) {

        if (node.firstChild) {
            MetaphorJs.dom.data(node, "mjs-transclude", MetaphorJs.dom.toFragment(node.childNodes));
        }

        var parent      = node.parentNode,
            next        = node.nextSibling,
            cloned      = MetaphorJs.dom.clone(contents),
            children    = toArray(cloned.childNodes);

        if (replace) {
            parent.removeChild(node);
            parent.insertBefore(cloned, next);
        }
        else {
            node.appendChild(cloned);
        }

        return children;
    }

    return null;
};