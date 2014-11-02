
var isString = require("../isString.js");

module.exports = function toFragment(nodes) {

    var fragment = window.document.createDocumentFragment(),
        i, l;

    if (isString(nodes)) {
        var tmp = window.document.createElement('div');
        tmp.innerHTML = nodes;
        nodes = tmp.childNodes;
    }

    if (!nodes) {
        return fragment;
    }

    if (nodes.nodeType) {
        fragment.appendChild(nodes);
    }
    else {
        if (nodes.item) {
            for (i = -1, l = nodes.length >>> 0; ++i !== l; fragment.appendChild(nodes[0])) {}
        }
        else {
            for (i = -1, l = nodes.length; ++i !== l; fragment.appendChild(nodes[i])) {}
        }
    }

    return fragment;
};