
require("./__init.js");
const isString = require("metaphorjs-shared/src/func/isString.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.toFragment = function dom_toFragment(nodes, doc) {

    const fragment = (doc || window.document).createDocumentFragment();
    let i, l;

    if (isString(nodes)) {
        const tmp = window.document.createElement('div');
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
            const tmpNodes = nodes;
            nodes = [];
            for (i = -1, l = tmpNodes.length >>> 0; ++i !== l; nodes.push(tmpNodes[i])) {}
        }

        for (i = -1, l = nodes.length; ++i !== l; fragment.appendChild(nodes[i])) {}
    }

    return fragment;
};