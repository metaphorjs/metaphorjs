
var defineClass = require("../../../metaphorjs-class/src/func/defineClass.js"),
    addListener = require("../func/event/addListener.js"),
    removeListener = require("../func/event/removeListener.js"),
    getNodeConfig = require("../func/dom/getNodeConfig.js"),
    bind = require("../func/bind.js"),
    getScrollParent = require("../func/dom/getScrollParent.js"),
    addClass = require("../func/dom/addClass.js"),
    getPosition = require("../func/dom/getPosition.js"),
    getScrollLeft = require("../func/dom/getScrollLeft.js"),
    getScrollTop = require("../func/dom/getScrollTop.js"),
    Promise = require("../../../metaphorjs-promise/src/lib/Promise.js"),
    raf = require('../../../metaphorjs-animate/src/func/raf.js');

module.exports = defineClass({

    $class: "plugin.ListBuffered",

    list: null,

    itemSize: null,
    itemsOffsite: 1,
    bufferState: null,
    scrollOffset: 0,
    horizontal: false,
    bufferEventDelegate: null,
    topStub: null,
    botStub: null,

    $init: function(list) {

        this.list = list;

        list.$intercept("scrollTo", this.scrollTo, this, "instead");
        list.$intercept("afterInit", this.afterInit, this, "before");

        list.bufferPlugin = this;
    },

    afterInit: function() {

        var self = this,
            cfg     = getNodeConfig(self.list.node);

        self.itemSize       = cfg.itemSize;
        self.itemsOffsite   = cfg.itemsOffsite || 5;
        self.horizontal     = cfg.horizontal || false;

        self.initScrollParent(cfg);
        self.initScrollStubs(cfg);

        self.bufferEventDelegate = bind(self.bufferUpdateEvent, self);

        addListener(self.scrollEl, "scroll", self.bufferEventDelegate);
        addListener(window, "resize", self.bufferEventDelegate);
    },

    initScrollParent: function(cfg) {
        var self = this;
        self.scrollEl = getScrollParent(self.list.parentEl);
    },

    initScrollStubs: function(cfg) {

        var self    = this,
            list    = self.list,
            parent  = list.parentEl,
            prev    = list.prevEl,
            ofsTop,
            ofsBot,
            i,
            style = {
                fontSize: 0,
                lineHeight: 0,
                padding: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingBottom: 0,
                paddingRight: 0,
                margin: 0,
                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0
            };

        self.topStub       = ofsTop = window.document.createElement(cfg.stub || "div");
        self.botStub       = ofsBot = window.document.createElement(cfg.stub || "div");

        addClass(ofsTop, "mjs-buffer-top");
        addClass(ofsBot, "mjs-buffer-bottom");
        for (i in style) {
            ofsTop.style[i] = style[i];
            ofsBot.style[i] = style[i];
        }

        parent.insertBefore(ofsTop, prev ? prev.nextSibling : parent.firstChild);
        parent.insertBefore(ofsBot, list.nextEl);

        list.prevEl     = ofsTop;
        list.nextEl     = ofsBot;
    },

    getScrollOffset: function() {

        var self        = this,
            position    = getPosition(self.topStub, self.scrollEl),
            ofs         = self.horizontal ? position.left : position.top;

        return self.scrollOffset = ofs;
    },

    getBufferState: function(updateScrollOffset) {

        var self        = this,
            scrollEl    = self.scrollEl,
            hor         = self.horizontal,
            html        = window.document.documentElement,
            size        = scrollEl === window ?
                          (window[hor ? "innerWidth" : "innerHeight"] ||
                           html[hor ? "clientWidth" : "clientHeight"]):
                          scrollEl[hor ? "offsetWidth" : "offsetHeight"],
            scroll      = hor ? getScrollLeft(scrollEl) : getScrollTop(scrollEl),
            isize       = self.itemSize,
            off         = self.itemsOffsite,
            offset      = updateScrollOffset ? self.getScrollOffset() : self.scrollOffset,
            cnt         = self.list.renderers.length,
            viewFirst,
            viewLast,
            first,
            last;


        scroll  = Math.max(0, scroll + offset);
        first   = Math.ceil(scroll / isize);

        if (first < 0) {
            first = 0;
        }

        viewFirst = first;

        last    = viewLast = first + Math.ceil(size / isize);
        first   = first > off ? first - off : 0;
        last   += off;

        if (last > cnt - 1) {
            last = cnt - 1;
        }

        if (first > last) {
            return self.bufferState;
        }

        return self.bufferState = {
            first: first,
            last: last,
            viewFirst: viewFirst,
            viewLast: viewLast,
            ot: first * isize,
            ob: (cnt - last - 1) * isize
        };
    },

    updateStubs: function(bs) {
        var self        = this,
            hor         = self.horizontal;

        self.topStub.style[hor ? "width" : "height"] = bs.ot + "px";
        self.botStub.style[hor ? "width" : "height"] = bs.ob + "px";
    },

    bufferUpdateEvent: function() {
        var self = this;
        self.list.queue.add(self.updateScrollBuffer, self);
    },


    updateScrollBuffer: function(reset) {

        var self        = this,
            list        = self.list,
            prev        = self.bufferState,
            parent      = list.parentEl,
            rs          = list.renderers,
            bot         = self.botStub,
            bs          = self.getBufferState(false),
            promise     = new Promise,
            fragment,
            i, x, r;

        if (!bs) {
            return null;
        }

        if (!prev || bs.first != prev.first || bs.last != prev.last) {
            list.trigger("buffer-change", self, bs, prev);
        }

        raf(function(){

            //TODO: account for tag mode

            if (reset || !prev || bs.last < prev.first || bs.first > prev.last){

                //remove old and append new
                if (prev) {
                    for (i = prev.first, x = prev.last; i <= x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
                fragment = window.document.createDocumentFragment();
                for (i = bs.first, x = bs.last; i <= x; i++) {
                    r = rs[i];
                    if (r) {
                        if (!r.rendered) {
                            list.renderItem(i);
                        }
                        fragment.appendChild(r.el);
                        r.attached = true;
                    }
                }

                parent.insertBefore(fragment, bot);

            }
            else {

                if (prev.first < bs.first) {
                    for (i = prev.first, x = bs.first; i < x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
                else if (prev.first > bs.first) {
                    fragment = window.document.createDocumentFragment();
                    for (i = bs.first, x = prev.first; i < x; i++) {
                        r = rs[i];
                        if (r) {
                            if (!r.rendered) {
                                list.renderItem(i);
                            }
                            fragment.appendChild(r.el);
                            r.attached = true;
                        }
                    }
                    parent.insertBefore(fragment, rs[prev.first].el);
                }

                if (prev.last < bs.last) {
                    fragment = window.document.createDocumentFragment();
                    for (i = prev.last + 1, x = bs.last; i <= x; i++) {
                        r = rs[i];
                        if (r) {
                            if (!r.rendered) {
                                list.renderItem(i);
                            }
                            fragment.appendChild(r.el);
                            r.attached = true;
                        }
                    }
                    parent.insertBefore(fragment, bot);
                }
                else if (prev.last > bs.last) {
                    for (i = bs.last + 1, x = prev.last; i <= x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
            }

            self.updateStubs(bs);
            list.trigger("buffer-update", self);
            self.onBufferStateChange(bs, prev);

            promise.resolve();
        });

        return promise;
    },

    // not finished: todo unbuffered and animation
    scrollTo: function(index) {

        var self    = this,
            list    = self.list,
            isize   = self.itemSize,
            sp      = self.scrollEl || getScrollParent(list.parentEl),
            hor     = self.horizontal,
            prop    = hor ? "scrollLeft" : "scrollTop",
            promise = new Promise,
            pos;


        list.queue.append(function(){

            raf(function(){
                pos     = isize * index;
                if (sp === window) {
                    window.scrollTo(
                        hor ? pos : getScrollLeft(),
                        !hor ? pos : getScrollTop()
                    );
                }
                else {
                    sp[prop] = pos;
                }
                promise.resolve();
            });
            return promise;
        });


        return promise;
    },

    onBufferStateChange: function(bs, prev) {},


    $beforeHostDestroy: function() {

        var self = this,
            parent = self.list.parentEl;

        parent.removeChild(self.topStub);
        parent.removeChild(self.botStub);
        removeListener(self.scrollEl, "scroll", self.bufferEventDelegate);
        removeListener(window, "resize", self.bufferEventDelegate);
    }
});