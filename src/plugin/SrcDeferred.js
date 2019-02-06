require("metaphorjs-shared/src/lib/Queue.js");
require("../func/dom/getScrollParent.js");
require("../func/dom/getPosition.js");
require("../func/dom/getScrollTop.js");
require("../func/dom/getScrollLeft.js");
require("../func/dom/getWidth.js");
require("../func/dom/getHeight.js");
require("../func/dom/addListener.js");
require("../func/dom/removeListener.js");

var cls = require("metaphorjs-class/src/cls.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = cls({

    $class: "MetaphorJs.plugin.SrcDeferred",

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
        directive.$intercept("onScopeChange", self.onScopeChange, self, "instead");
        directive.$intercept("_initDirective", self.$_initDirective, self, "before");
        self.queue = 
            directive.queue || 
            new MetaphorJs.lib.Queue({auto: true, async: true, 
                            mode: MetaphorJs.lib.Queue.REPLACE, thenable: true});
    },

    $_initDirective: function() {

        var self = this;

        self.scrollEl = MetaphorJs.dom.getScrollParent(self.directive.node);
        self.scrollDelegate = bind(self.onScroll, self);
        self.resizeDelegate = bind(self.onResize, self);

        MetaphorJs.dom.addListener(self.scrollEl, "scroll", self.scrollDelegate);
        MetaphorJs.dom.addListener(window, "resize", self.resizeDelegate);
    },

    isVisible: function() {

        if (!this.checkVisibility) {
            return true;
        }

        var self = this,
            sEl = self.scrollEl,
            st = MetaphorJs.dom.getScrollTop(sEl),
            sl = MetaphorJs.dom.getScrollLeft(sEl),
            w = self.sw,
            h = self.sh,
            t,l;

        if (!self.position) {
            self.position = MetaphorJs.dom.getPosition(self.directive.node, sEl);
        }
        if (!w) {
            w = self.sw = MetaphorJs.dom.getWidth(sEl);
            h = self.sh = MetaphorJs.dom.getHeight(sEl);
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

    onScopeChange: function() {
        var self = this;
        self.queue.add(self.changeIfVisible, self);
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
            MetaphorJs.dom.removeListener(self.scrollEl, "scroll", self.scrollDelegate);
            MetaphorJs.dom.removeListener(window, "resize", self.resizeDelegate);
            self.scrollEl = null;
            self.checkVisibility = false;
        }
    },

    $beforeHostDestroy: function(){
        this.stopWatching();
        this.queue.$destroy();
    }

});