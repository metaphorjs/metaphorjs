
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.commentWrap = function commentWrap(node, name) {
    name = name || "";

    var before = window.document.createComment("<" + name),
        after = window.document.createComment(name + ">"),
        parent = node.parentNode;

    parent.insertBefore(before, node);

    if (node.nextSibling) {
        parent.insertBefore(after, node.nextSibling);
    }
    else {
        parent.appendChild(after);
    }

    return [before, after];
};