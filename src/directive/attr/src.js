

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

    lastPromise: null,
    src: null,

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
        self.cancelPrevious();
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

        self.src = src;

        if (self.noCache) {
            src += (src.indexOf("?") != -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.usePreload) {
            self.lastPromise = preloadImage(src).done(self.onImagePreloaded, self);
        }
        else {
            if (self.node) {
                self.node.src = src;
                setAttr(self.node, "src", src);
                self.onSrcChanged();
            }
        }
    },

    cancelPrevious: function() {
        var self = this;

        if (self.lastPromise) {
            if (self.lastPromise.isPending()) {
                self.lastPromise.abort();
            }
            self.lastPromise = null;
        }
    },

    onImagePreloaded: function() {
        var self = this,
            src = self.src;

        if (self && self.node) {
            raf(function(){
                self.node.src = src;
                setAttr(self.node, "src", src);
                self.onSrcChanged();
                self.node.style.visibility = "";
                self.scope.$scheduleCheck(50);
            });
        }
        self.lastPromise = null;
    },

    onSrcChanged: function() {

    },

    onScopeReset: function() {
        this.cancelPrevious();
        this.$super();
    },

    destroy: function() {

        var self = this;

        if (!self.$destroyed) {
            self.cancelPrevious();
            self.queue.destroy();
            self.$super();
        }
    }
}));