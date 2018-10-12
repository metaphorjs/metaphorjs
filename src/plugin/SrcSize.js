
require("../lib/Expression.js");

var cls = require("metaphorjs-class/src/cls.js"),
    getAttr = require("../func/dom/getAttr.js"),
    removeStyle = require("../func/dom/removeStyle.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = cls({

    $class: "MetaphorJs.plugin.SrcSize",
    directive: null,

    width: null,
    height: null,

    origOnChange: null,

    $init: function(directive) {

        var self = this;
        self.directive = directive;

        self.origOnChange = directive.$intercept("onSrcChanged", self.onSrcChanged, self, "after");
    },

    $afterHostInit: function(scope, node) {

        var attr    = self.directive.attr,
            cfg     = attr ? attr.config : {},
            size    = cfg.preloadSize,
            style   = node.style;

        if (size !== "attr") {
            size    = MetaphorJs.lib.Expression.parse(size)(scope);
        }

        var width   = size === "attr" ? parseInt(getAttr(node, "width"), 10) : size.width,
            height  = size === "attr" ? parseInt(getAttr(node, "height"), 10) : size.height;

        if (width || height) {
            style.display = "block";
        }

        if (width) {
            style.width = width + "px";
        }
        if (height) {
            style.height = height + "px";
        }
    },

    onSrcChanged: function() {

        var self        = this,
            directive   = self.directive,
            node        = directive.node;

        directive.onSrcChanged = self.origOnChange;

        removeStyle(node, "width");
        removeStyle(node, "height");
        removeStyle(node, "display");

        self.$destroy();
    }

});