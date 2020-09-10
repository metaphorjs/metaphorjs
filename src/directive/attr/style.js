require("../../func/dom/removeStyle.js");
require("../../lib/Config.js");

const Directive = require("../../app/Directive.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    toBool = require("metaphorjs-shared/src/func/toBool.js"),
    toCamelCase = require("metaphorjs-shared/src/func/toCamelCase.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("style", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Style",
    id: "style",

    initDirective: function() {

        var self = this,
            config = self.config;

        config.on("value", self.onStateChange, self);
        config.eachProperty(function(k){
            if (k.indexOf("value.") === 0) {
                config.on(k, self.onStateChange, self);
            }
        });

        this.$super();
    },

    initChange: function() {
        this.onStateChange();
    },

    getCurrentValue: function() {
        var style = this.config.getAllValues();

        if (style[""]) {
            extend(style, style[""]);
            delete style[''];
        }

        return style;
    },

    _applyStyle: function() {
        var self    = this,
            node    = self.node,
            style   = node.style,
            props   = self.getCurrentValue(),
            prev    = self.prev,
            k, trg;

        for (k in prev) {
            if (!props || props[k] === undefined) {
                MetaphorJs.dom.removeStyle(node, k);
            }
        }

        if (props) {
            for (k in props) {

                trg = toCamelCase(k);
                if (props[k] !== undefined && props[k] !== null) {
                    style[trg] = props[k];
                }
                else {
                    MetaphorJs.dom.removeStyle(node, k);
                }
            }
        }

        self.prev = props;
    },

    onStateChange: function() {

        var tmt = this.config.get("async");
        if (toBool(tmt)) {
            tmt = parseInt(tmt) == tmt ? parseInt(tmt) : null;
            async(this._applyStyle, this, [], tmt);
        }
        else {
            this._applyStyle();
        }
    }
}, {
    initConfig: function(config, instance) {
        config.setDefaultMode("async", MetaphorJs.lib.Config.MODE_STATIC);
    }
}));