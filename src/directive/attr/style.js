
var Directive = require("../../class/Directive.js"),
    undf = require("../../var/undf.js"),
    toCamelCase = require("../../func/toCamelCase.js"),
    removeStyle = require("../../func/dom/removeStyle.js");

/*
value is always an object in the end
DO NOT MIX style="{}" with style.prop="expression".
 */


Directive.registerAttribute("style", 1000, Directive.$extend({

    $init: function(scope, node, expr, renderer, attr) {

        var values = attr ? attr.values : null,
            parts, k;

        if (values) {
            parts = [];
            for (k in values) {
                parts.push(k + ': ' + values[k]);
            }
            expr = '{' + parts.join(', ') + '}';
        }

        this.$super(scope, node, expr);
    },

    onChange: function() {

        var self    = this,
            node    = self.node,
            style   = node.style,
            props   = self.watcher.getLastResult(),
            prev    = self.watcher.getPrevValue(),
            k, trg;

        for (k in prev) {
            if (!props || props[k] === undf) {
                removeStyle(node, k);
            }
        }

        if (props) {
            for (k in props) {

                trg = toCamelCase(k);

                if (props[k] !== undf && props[k] !== null) {
                    style[trg] = props[k];
                }
                else {
                    removeStyle(node, trg);
                }
            }
        }
    }
}));