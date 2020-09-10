
require("../lib/Expression.js");
require("../func/dom/getAttr.js");
require("../func/dom/removeStyle.js");

const cls = require("metaphorjs-class/src/cls.js"),
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

        directive.$intercept("initDirective", self.$initDirective, self, "after");
        self.origOnChange = directive.$intercept("onSrcChanged", self.onSrcChanged, self, "after");
    },

    $initDirective: function() {

        var attr    = self.directive.attr,
            node    = self.directive.node,
            state   = self.directive.state,
            cfg     = attr ? attr.config : {},
            size    = cfg.preloadSize,
            style   = node.style;

        if (size !== "attr") {
            size    = MetaphorJs.lib.Expression.parse(size)(state);
        }

        var width   = size === "attr" ? parseInt(MetaphorJs.dom.getAttr(node, "width"), 10) : size.width,
            height  = size === "attr" ? parseInt(MetaphorJs.dom.getAttr(node, "height"), 10) : size.height;

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

        MetaphorJs.dom.removeStyle(node, "width");
        MetaphorJs.dom.removeStyle(node, "height");
        MetaphorJs.dom.removeStyle(node, "display");

        self.$destroy();
    }

});