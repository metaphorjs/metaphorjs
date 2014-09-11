

module.exports = function() {

    var rOvf        = /(auto|scroll)/,
        body,

        style       = window.getComputedStyle ?
                function (node, prop) {
                    return getComputedStyle(node, null)[prop];
                }:
                function(node, prop) {
                    return node.currentStyle ?
                            "" + node.currentStyle[prop] :
                            "" + node.style[prop];
                },

        overflow    = function (node) {
            return style(node, "overflow") + style(node, "overflowY") + style(node, "overflowY");
        },

        scroll      = function (node) {
            return rOvf.test(overflow(node));
        };

    return function(node) {

        if (!body) {
            body = document.body;
        }

        var parent = node;

        while (parent) {
            if (parent === body) {
                return window;
            }
            if (scroll(parent)) {
                return parent;
            }
            parent = parent.parentNode;
        }

        return window;
    };
}();