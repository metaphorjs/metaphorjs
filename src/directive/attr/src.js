require("metaphorjs-shared/src/lib/Queue.js");
require("../../func/dom/preloadImage.js");
require("../../func/dom/setAttr.js");
require("../../lib/Config.js");

var raf = require("metaphorjs-animate/src/func/raf.js"),
    Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("src", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Src",

    queue: null,
    usePreload: true,
    noCache: false,
    attr: null,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, config, renderer, attrSet) {

        var ms = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("deferred", "bool", ms);
        config.setType("noCache", "bool", ms);
        config.setType("noPreload", "bool", ms);
        config.setDefaultMode("preloadSize", ms);
        config.setDefaultMode("plugin", ms);

        var self = this;

        if (config.get("deferred")) {
            self.$plugins.push("MetaphorJs.plugin.SrcDeferred");
        }
        if (config.get("preloadSize")) {
            self.$plugins.push("MetaphorJs.plugin.SrcSize");
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

    initDirective: function(scope, node, config, renderer, attrSet) {

        var self = this;

        self.usePreload = !config.get("noPreload");

        if (self.usePreload) {
            node.style.visibility = "hidden"
        }

        self.queue = new MetaphorJs.lib.Queue({auto: true, async: true, 
                                    mode: MetaphorJs.lib.Queue.REPLACE, thenable: true});

        self.$super(scope, node, config, renderer, attrSet);
    },


    onScopeChange: function() {
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

        var src = self.config.get("value");

        if (!src) {
            return;
        }

        self.src = src;

        if (self.config.get("noCache")) {
            src += (src.indexOf("?") !== -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.usePreload) {
            self.lastPromise = MetaphorJs.dom.preloadImage(src);
            if (self.lastPromise) {
                self.lastPromise.done(self.onImagePreloaded, self);
            }
        }
        else {
            if (self.node) {
                self.node.src = src;
                MetaphorJs.dom.setAttr(self.node, "src", src);
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
                    MetaphorJs.dom.setAttr(self.node, "src", src);
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