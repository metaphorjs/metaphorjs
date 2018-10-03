require("metaphorjs-promise/src/lib/Promise.js");


var cls = require("metaphorjs-class/src/cls.js"),
    addListener = require("../func/event/addListener.js"),
    removeListener = require("../func/event/removeListener.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    getScrollParent = require("../func/dom/getScrollParent.js"),
    addClass = require("../func/dom/addClass.js"),
    getPosition = require("../func/dom/getPosition.js"),
    getScrollLeft = require("../func/dom/getScrollLeft.js"),
    getScrollTop = require("../func/dom/getScrollTop.js"),
    raf = require('metaphorjs-animate/src/func/raf.js');

module.exports = cls({

    $class: "MetaphorJs.plugin.ListBuffered",

    list: null,
    enabled: true,

    itemSize: null,
    itemsOffsite: 5,
    bufferState: null,
    scrollOffset: 0,
    horizontal: false,
    dynamicOffset: false,
    bufferEventDelegate: null,
    topStub: null,
    botStub: null,

    $init: function(list) {

        var self    = this;

        self.list = list;

        list.$intercept("afterInit", this.afterInit, this, "before");
        list.$intercept("doRender", this.doRender, this, "instead");

        list.$implement({

            scrollTo: self.$bind(self.scrollTo),

            reflectChanges: function(vars) {

                if (!self.enabled) {
                    self.$super(vars);
                }
                else {
                    self.getScrollOffset();
                    list.removeOldElements(vars.oldRenderers);
                    list.queue.append(self.updateScrollBuffer, self, [true]);
                    list.trigger("change", list);
                }
            }
        });
    },

    afterInit: function() {

        var self    = this,
            attr    = self.list.attr,
            cfg     = attr ? attr.config : {};

        self.itemSize       = cfg.itemSize;
        self.itemsOffsite   = parseInt(cfg.itemsOffsite || 5, 10);
        self.horizontal     = cfg.horizontal || false;
        self.dynamicOffset  = cfg.dynamicOffset || false;

        self.initScrollParent(cfg);
        self.initScrollStubs(cfg);

        self.bufferEventDelegate = bind(self.bufferUpdateEvent, self);

        self.up();

        self.list.scope.$on("freeze", self.down, self);
        self.list.scope.$on("unfreeze", self.up, self);
    },

    doRender: function() {
        this.getScrollOffset();
        this.updateScrollBuffer();
    },

    up: function() {
        var self = this;
        addListener(self.scrollEl, "scroll", self.bufferEventDelegate);
        addListener(window, "resize", self.bufferEventDelegate);
    },

    down: function() {
        var self = this;
        removeListener(self.scrollEl, "scroll", self.bufferEventDelegate);
        removeListener(window, "resize", self.bufferEventDelegate);
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

    getItemsPerRow: function() {
        return 1;
    },

    getRowHeight: function() {
        return this.itemSize;
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
            sh          = scrollEl.scrollHeight,
            perRow      = self.getItemsPerRow(),
            isize       = self.getRowHeight(),
            off         = self.itemsOffsite,
            offset      = updateScrollOffset ? self.getScrollOffset() : self.scrollOffset,
            cnt         = Math.ceil(self.list.renderers.length / perRow),
            viewFirst,
            viewLast,
            first,
            last;

        //scroll  = Math.max(0, scroll - offset);
        first   = Math.ceil((scroll - offset) / isize);

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

        if (sh && scroll + size >= sh && self.bufferState) {
            if (self.bufferState.last == last * perRow) {
                last += off;
            }
        }

        if (first > last) {
            return self.bufferState;
        }

        return self.bufferState = {
            first: first * perRow,
            viewFirst: viewFirst * perRow,
            last: last * perRow,
            viewLast: viewLast * perRow,
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
            bs          = self.getBufferState(self.dynamicOffset),
            promise     = new MetaphorJs.lib.Promise,
            doc         = window.document,
            fragment,
            i, x, r;

        if (!bs) {
            return null;
        }

        if (!prev || bs.first != prev.first || bs.last != prev.last) {
            list.trigger("buffer-change", self, bs, prev);
        }

        raf(function(){

            if (self.$isDestroyed()) {
                return;
            }

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
                fragment = doc.createDocumentFragment();
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
                    fragment = doc.createDocumentFragment();
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
                    fragment = doc.createDocumentFragment();
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
            promise = new MetaphorJs.lib.Promise,
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
        self.down();
    }
});