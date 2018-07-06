
var defineClass = require("../../../metaphorjs-class/src/func/defineClass.js"),
    getScrollParent = require("../func/dom/getScrollParent.js"),
    getPosition = require("../func/dom/getPosition.js"),
    getScrollTop = require("../func/dom/getScrollTop.js"),
    getScrollLeft = require("../func/dom/getScrollLeft.js"),
    getWidth = require("../func/dom/getWidth.js"),
    getHeight = require("../func/dom/getHeight.js"),
    addListener = require("../func/event/addListener.js"),
    removeListener = require("../func/event/removeListener.js"),
    Queue = require("../lib/Queue.js"),
    bind = require("../func/bind.js");

module.exports = defineClass({

    $class: "plugin.SrcDeferred",

    directive: null,

    queue: null,
    scrollEl: null,
    scrollDelegate: null,
    resizeDelegate: null,
    position: null,
    sw: null,
    sh: null,
    checkVisibility: true,

    $init: function(directive) {

        var self = this;
        self.directive = directive;
        directive.$intercept("onChange", self.onChange, self, "instead");
        self.queue = 
            directive.queue || 
            new Queue({auto: true, async: true, mode: Queue.REPLACE, thenable: true});
    },

    $beforeHostInit: function(scope, node) {

        var self = this;

        self.scrollEl = getScrollParent(node);
        self.scrollDelegate = bind(self.onScroll, self);
        self.resizeDelegate = bind(self.onResize, self);

        addListener(self.scrollEl, "scroll", self.scrollDelegate);
        addListener(window, "resize", self.resizeDelegate);
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
            self.position = getPosition(self.directive.node, sEl);
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
        self.directive.queue.add(self.changeIfVisible, self);
    },

    onResize: function() {
        var self = this;
        self.position = null;
        self.sw = null;
        self.directive.queue.add(self.changeIfVisible, self);
    },

    onChange: function() {
        var self = this;
        self.directive.queue.add(self.changeIfVisible, self);
    },

    changeIfVisible: function() {
        var self    = this;

        if (self.isVisible()) {
            self.stopWatching();
            return self.directive.doChange();
        }
    },

    stopWatching: function() {
        var self = this;
        if (self.scrollEl) {
            removeListener(self.scrollEl, "scroll", self.scrollDelegate);
            removeListener(window, "resize", self.resizeDelegate);
            self.scrollEl = null;
            self.checkVisibility = false;
        }
    },

    $beforeHostDestroy: function(){
        this.stopWatching();
        this.queue.destroy();
    }

});