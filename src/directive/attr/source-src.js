

var setAttr = require("../../func/dom/setAttr.js"),
    Directive = require("../../class/Directive.js"),
    select = require("metaphorjs/src/func/dom/select.js");

Directive.registerAttribute("source-src", 1000, Directive.$extend({

    $class: "MetaphorJs.Directive.attr.SourceSrc",

    usePreload: true,
    noCache: false,
    attr: null,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, expr, renderer, attr) {

        var self = this,
            cfg = attr ? attr.config : {};

        self.attr = attr;

        if (cfg.deferred) {
            self.$plugins.push("plugin.SrcDeferred");
        }
        /*if (cfg.preloadSize) {
            self.$plugins.push("plugin.SrcSize");
        }*/
        if (cfg.plugin) {
            var tmp = cfg.plugin.split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(tmp[i].trim());
            }
        }

        self.$super(scope, node, expr);
    },

    $init: function(scope, node, expr, renderer, attr) {

        var self = this,
            cfg = attr ? attr.config : {};

        if (cfg.noCache) {
            self.noCache = true;
        }
        self.$super(scope, node, expr);
    },

    onChange: function() {
        this.doChange();
    },

    doChange: function() {
        var self = this;
        
        if (self.$destroyed || self.$destroying) {
            return;
        }

        var src = self.watcher.getLastResult();

        if (!src) {
            return;
        }

        self.src = src;

        if (self.noCache) {
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
            srcs = select("source", node),
            source = window.document.createElement("source"),
            i, l;

        if (srcs.length) {
            for (i  = 0, l = srcs.length; i < l; i++) {
                node.removeChild(srcs[i]);
            }
        }

        setAttr(source, "src", src);
        node.appendChild(source);
    },

    onSrcChanged: function() {

    }
}));