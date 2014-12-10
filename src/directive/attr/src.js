

var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),
    preloadImage = require("../../func/preloadImage.js"),
    setAttr = require("../../func/dom/setAttr.js"),
    Directive = require("../../class/Directive.js"),
    Queue = require("../../lib/Queue.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js"),
    trim = require("../../func/trim.js");

Directive.registerAttribute("mjs-src", 1000, defineClass({

    $extends: Directive,

    queue: null,
    usePreload: true,
    noCache: false,

    $constructor: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.deferred) {
            self.$plugins.push("plugin.SrcDeferred");
        }
        if (cfg.preloadSize) {
            self.$plugins.push("plugin.SrcSize");
        }
        if (cfg.srcPlugin) {
            var tmp = cfg.srcPlugin.split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(trim(tmp[i]));
            }
        }

        self.$super(scope, node, expr);
    },

    $init: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.noCache) {
            self.noCache = true;
        }

        if (cfg.noPreload) {
            self.usePreload = false;
        }
        else {
            node.style.visibility = "hidden"
        }

        self.queue = new Queue({auto: true, async: true, mode: Queue.REPLACE, thenable: true});
        self.$super(scope, node, expr);
    },


    onChange: function() {
        var self = this;
        if (self.usePreload) {
            self.node.style.visibility = "hidden";
        }
        self.queue.add(self.doChange, self);
    },

    doChange: function() {

        var self = this,
            src = self.watcher.getLastResult();

        if (!src) {
            return;
        }

        if (self.noCache) {
            src += (src.indexOf("?") != -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.usePreload) {
            return preloadImage(src).done(function(){
                if (self && self.node) {
                    raf(function(){
                        self.node.src = src;
                        setAttr(self.node, "src", src);
                        self.onSrcChanged();
                        self.node.style.visibility = "";
                    });
                }
            });
        }
        else {
            if (self.node) {
                self.node.src = src;
                setAttr(self.node, "src", src);
                self.onSrcChanged();
            }
        }
    },

    onSrcChanged: function() {

    },

    destroy: function() {
        this.queue.destroy();
        this.$super();
    }
}));