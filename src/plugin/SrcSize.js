
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    getAttr = require("../func/dom/getAttr.js"),
    removeStyle = require("../func/dom/removeStyle.js");

module.exports = defineClass({

    $class: "plugin.SrcSize",
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

        var attrMap = self.directive.attrMap,
            cfg     = attrMap['modifier']['src'] ? attrMap['modifier']['src'] : {},
            size    = cfg.preloadSize,
            style   = node.style;

        if (size !== "attr") {
            size    = createGetter(size)(scope);
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