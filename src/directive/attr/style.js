require("../../func/dom/removeStyle.js")

var Directive = require("../../app/Directive.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    toCamelCase = require("metaphorjs-shared/src/func/toCamelCase.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/*
value is always an object in the end
DO NOT MIX style="{}" with style.prop="expression".
 */


Directive.registerAttribute("style", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Style",
    $init: function(scope, node, config, renderer, attrSet) {

        var self = this;

        config.eachProperty(function(k){
            if (k.indexOf("value.") === 0) {
                config.on(k, self.onChange, self);
            }
        });

        this.$super(scope, node, config);
    },

    getCurrentValue: function() {
        var style = this.config.getAllValues();
        
        if (style[""]) {
            extend(style, style[""]);
            delete style[''];
        }

        return style;
    },

    onChange: function() {

        var self    = this,
            node    = self.node,
            style   = node.style,
            props   = self.getCurrentValue(),
            prev    = self.prev,
            k, trg;

        node = node.getDomApi ? node.getDomApi("style") : node;

        if (!node) {
            return;
        }

        for (k in prev) {
            if (!props || props[k] === undf) {
                MetaphorJs.dom.removeStyle(node, k);
            }
        }

        if (props) {
            for (k in props) {

                trg = toCamelCase(k);

                if (props[k] !== undf && props[k] !== null) {
                    style[trg] = props[k];
                }
                else {
                    MetaphorJs.dom.removeStyle(node, k);
                }
            }
        }

        self.prev = props;
    }
}));