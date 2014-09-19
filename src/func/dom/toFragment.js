
var isString = require("../isString.js");

module.exports = function toFragment(nodes) {

    var fragment = document.createDocumentFragment();

    if (isString(nodes)) {
        var tmp = document.createElement('div');
        tmp.innerHTML = nodes;
        nodes = tmp.childNodes;
    }

    if (nodes.nodeType) {
        fragment.appendChild(nodes);
    }
    else {
        for(var i =- 1, l = nodes.length>>>0; ++i !== l; fragment.appendChild(nodes[0])){}
    }

    return fragment;
};