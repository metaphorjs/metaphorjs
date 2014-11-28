
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    getNodeConfig = require("../func/dom/getNodeConfig.js"),
    getAttr = require("../func/dom/getAttr.js");

module.exports = nsAdd("plugin.SrcSize", defineClass({

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

        var cfg     = getNodeConfig(node, scope),
            size    = cfg.preloadSize,
            style   = node.style;

        if (size != "attr") {
            size    = createGetter(size)(scope);
        }

        var width   = size == "attr" ? parseInt(getAttr(node, "width"), 10) : size.width,
            height  = size == "attr" ? parseInt(getAttr(node, "height"), 10) : size.height;

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
            node        = directive.node,
            style       = node.style;

        directive.onSrcChanged = self.origOnChange;

        if (style.removeProperty) {
            style.removeProperty('width');
            style.removeProperty('height');
            style.removeProperty('display');
        } else {
            style.removeAttribute('width');
            style.removeAttribute('height');
            style.removeAttribute('display');
        }

        self.$destroy();
    }

}));