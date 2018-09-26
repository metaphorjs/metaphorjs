

var raf = require("metaphorjs-animate/src/func/raf.js"),
    preloadImage = require("../../func/preloadImage.js"),
    setAttr = require("../../func/dom/setAttr.js"),
    Directive = require("../../class/Directive.js"),
    Queue = require("../../lib/Queue.js"),
    trim = require("../../func/trim.js");

Directive.registerAttribute("src", 1000, Directive.$extend({

    $class: "MetaphorJs.Directive.attr.Src",

    queue: null,
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
            self.$plugins.push("MetaphorJs.plugin.SrcDeferred");
        }
        if (cfg.preloadSize) {
            self.$plugins.push("MetaphorJs.plugin.SrcSize");
        }
        if (cfg.plugin) {
            var tmp = cfg.plugin.split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(trim(tmp[i]));
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

        if (self.usePreload) {
            self.lastPromise = preloadImage(src);
            if (self.lastPromise) {
                self.lastPromise.done(self.onImagePreloaded, self);
            }
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
                if (self.node) {
                    self.node.src = src;
                    setAttr(self.node, "src", src);
                    self.onSrcChanged();
                    self.node.style.visibility = "";
                    self.scope.$scheduleCheck(50);
                }
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

    onDestroy: function() {

        var self = this;

        if (!self.$destroyed) {
            self.cancelPrevious();
            self.queue.$destroy();
            self.$super();
        }
    }
}));