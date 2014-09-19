

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    preloadImage = require("../../func/preloadImage.js"),
    async = require("../../func/async.js"),
    bind = require("../../func/bind.js"),
    removeAttr = require("../../func/dom/removeAttr.js"),
    setAttr = require("../../func/dom/setAttr.js"),
    AttributeHandler = require("../../view/AttributeHandler.js"),
    getScrollParent = require("../../func/dom/getScrollParent.js"),
    getPosition = require("../../func/dom/getPosition.js"),
    getScrollTop = require("../../func/dom/getScrollTop.js"),
    getScrollLeft = require("../../func/dom/getScrollLeft.js"),
    getWidth = require("../../func/dom/getWidth.js"),
    getHeight = require("../../func/dom/getHeight.js"),
    Queue = require("../../lib/Queue.js"),
    addListener = require("../../func/event/addListener.js"),
    removeListener = require("../../func/event/removeListener.js"),
    raf = require("../../../../metaphorjs-animate/src/func/raf.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js");

registerAttributeHandler("mjs-src", 1000, defineClass({

    $extends: AttributeHandler,

    scrollEl: null,
    scrollDelegate: null,
    resizeDelegate: null,
    position: null,
    sw: null,
    sh: null,
    queue: null,
    checkVisibility: true,
    usePreload: true,

    initialize: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.deferred) {
            self.scrollEl = getScrollParent(node);
            self.scrollDelegate = bind(self.onScroll, self);
            self.resizeDelegate = bind(self.onResize, self);

            addListener(self.scrollEl, "scroll", self.scrollDelegate);
            addListener(window, "resize", self.resizeDelegate);
        }
        else {
            self.checkVisibility = false;
        }

        if (cfg.noPreload) {
            self.usePreload = false;
        }

        self.queue = new Queue({auto: true, async: true, mode: Queue.ONCE});

        self.supr(scope, node, expr);

    },

    isVisible: function() {

        if (!this.checkVisibility) {
            return true;
        }

        var self = this,
            sEl = self.scrollEl,
            st = getScrollTop(sEl),
            sl = getScrollLeft(sEl),
            w = self.sw,
            h = self.sh,
            t,l;

        if (!self.position) {
            self.position = getPosition(self.node, sEl);
        }
        if (!w) {
            w = self.sw = getWidth(sEl);
            h = self.sh = getHeight(sEl);
        }

        t = self.position.top;
        l = self.position.left;

        return (t > st && t < (st + h)) &&
               (l > sl && l < (sl + w));
    },

    onScroll: function() {
        var self = this;
        self.queue.add(self.changeIfVisible, self);
    },

    onResize: function() {
        var self = this;
        self.position = null;
        self.sw = null;
        self.queue.add(self.changeIfVisible, self);
    },

    onChange: function() {
        var self = this;
        self.queue.add(self.changeIfVisible, self);
    },

    changeIfVisible: function() {
        var self    = this;

        if (self.isVisible()) {

            var src = self.watcher.getLastResult();
            self.stopWatching();
            if (self.usePreload) {
                preloadImage(src).done(function(){
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
        }
    },

    stopWatching: function() {
        var self = this;

        if (self.scrollEl) {
            removeListener(self.scrollEl, "scroll", self.scrollDelegate);
            removeListener(window, "resize", self.resizeDelegate);

            self.scrollDelegate = null;
            self.resizeDelegate = null;
            self.scrollEl = null;

            self.queue.destroy();
            self.queue = null;

            self.checkVisibility = false;
        }
    },

    destroy: function() {

        var self = this;

        self.stopWatching();
        self.supr();
    }
}));