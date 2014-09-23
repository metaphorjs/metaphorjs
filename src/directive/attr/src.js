

var defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    preloadImage = require("../../func/preloadImage.js"),
    setAttr = require("../../func/dom/setAttr.js"),
    Directive = require("../../class/Directive.js"),
    Queue = require("../../lib/Queue.js"),
    raf = require("../../../../metaphorjs-animate/src/func/raf.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js");

Directive.registerAttribute("mjs-src", 1000, defineClass({

    $extends: Directive,

    queue: null,
    usePreload: true,

    $constructor: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.deferred) {
            self.$plugins.push("SrcDeferred");
        }

        self.$super(scope, node, expr);
    },

    $init: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.noPreload) {
            self.usePreload = false;
        }

        self.queue = new Queue({auto: true, async: true, mode: Queue.ONCE, thenable: true});
        self.$super(scope, node, expr);
    },


    onChange: function() {
        var self = this;
        self.queue.add(self.doChange, self);
    },

    doChange: function() {
        var self = this,
            src = self.watcher.getLastResult();

        if (self.usePreload) {
            return preloadImage(src).done(function(){
                if (self && self.node) {
                    raf(function(){
                        self.node.src = src;
                        setAttr(self.node, "src", src);
                    });
                }
            });
        }
        else {
            self.node.src = src;
            setAttr(self.node, "src", src);
        }
    },

    destroy: function() {
        this.queue.destroy();
        this.$super();
    }
}));