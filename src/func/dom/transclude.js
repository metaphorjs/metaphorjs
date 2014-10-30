
var parentData = require("../dom/parentData.js"),
    data = require("../dom/data.js"),
    toFragment = require("../dom/toFragment.js"),
    clone = require("../dom/clone.js"),
    toArray = require("../array/toArray.js");

module.exports = function transclude(node, replace) {

    var contents  = parentData(node, 'mjs-transclude');

    if (contents) {

        if (node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        var parent      = node.parentNode,
            next        = node.nextSibling,
            cloned      = clone(contents),
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