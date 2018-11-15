require("metaphorjs/src/func/dom/select.js");
require("../../func/dom/setAttr.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("source-src", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.SourceSrc",

    usePreload: true,
    attr: null,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, config, renderer, attrSet) {

        config.setProperty("deferred", {type: "bool"});
        config.setProperty("noCache", {type: "bool"});
        config.lateInit();

        var self = this;

        if (config.get("deferred")) {
            self.$plugins.push("plugin.SrcDeferred");
        }

        if (config.get("plugin")) {
            var tmp = config.get("plugin").split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(tmp[i].trim());
            }
        }

        self.$super(scope, node, config);
    },


    onChange: function() {
        this.doChange();
    },

    doChange: function() {
        var self = this;
        
        if (self.$destroyed || self.$destroying) {
            return;
        }

        var src = self.config.get("value");

        if (!src) {
            return;
        }

        self.src = src;

        if (self.config.get("noCache")) {
            src += (src.indexOf("?") !== -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.node) {
            self.doChangeSource(src);
            self.onSrcChanged();
        }
    },

    doChangeSource: function(src) {
        var self = this,
            node = self.node,
            srcs = MetaphorJs.dom.select("source", node),
            source = window.document.createElement("source"),
            i, l;

        if (srcs.length) {
            for (i  = 0, l = srcs.length; i < l; i++) {
                node.removeChild(srcs[i]);
            }
        }

        MetaphorJs.dom.setAttr(source, "src", src);
        node.appendChild(source);
    },

    onSrcChanged: function() {

    }
}));