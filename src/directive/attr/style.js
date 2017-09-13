
var Directive = require("../../class/Directive.js"),
    undf = require("../../var/undf.js"),
    removeStyle = require("../../func/dom/removeStyle.js");

Directive.registerAttribute("mjs-style", 1000, Directive.$extend({

    onChange: function() {

        var self    = this,
            node    = self.node,
            style   = node.style,
            props   = self.watcher.getLastResult(),
            prev    = self.watcher.getPrevValue(),
            k;

        for (k in prev) {
            if (!props || props[k] === undf) {
                removeStyle(node, k);
            }
        }

        if (props) {
            for (k in props) {
                if (props[k] !== undf && props[k] !== null) {
                    style[k] = props[k];
                }
                else {
                    removeStyle(node, k);
                }
            }
        }
    }
}));