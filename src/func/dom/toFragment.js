
var isString = require("../isString.js");

module.exports = function toFragment(nodes, doc) {

    var fragment = (doc || window.document).createDocumentFragment(),
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
        // due to a bug in jsdom, we turn NodeList into array first
        if (nodes.item) {
            var tmpNodes = nodes;
            nodes = [];
            for (i = -1, l = tmpNodes.length >>> 0; ++i !== l; nodes.push(tmpNodes[i])) {}
        }

        for (i = -1, l = nodes.length; ++i !== l; fragment.appendChild(nodes[i])) {}
    }

    return fragment;
};