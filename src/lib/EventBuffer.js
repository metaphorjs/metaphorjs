
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    Observable = require("metaphorjs-observable/src/metaphorjs.observable.js"),
    bind = require("../func/bind.js"),
    addListener = require("../func/event/addListener.js"),
    removeListener = require("../func/event/removeListener.js"),
    getWidth = require("../func/dom/getWidth.js"),
    getHeight = require("../func/dom/getHeight.js"),
    getScrollTop = require("../func/dom/getScrollTop.js"),
    getScrollLeft = require("../func/dom/getScrollLeft.js"),
    raf = require("metaphorjs-animate/src/func/raf.js");


module.exports = function(){

    var bufferKey = function(event, interval) {
        return '$$' + event + "_" + interval;
    };

    var EventBuffer = defineClass({

        queue: null,
        observable: null,
        handlerDelegate: null,
        triggerDelegate: null,
        watchers: null,
        breaks: null,
        running: false,
        lastEvent: null,
        currentEvent: null,
        interval: null,

        $init: function(node, event, interval) {

            var self = this,
                key = bufferKey(event, interval);

            if (node[key]) {
                return node[key];
            }

            node[key] = self;


            self.breaks = {};
            self.watchers = {};
            self.node = node;
            self.event = event;
            self.observable = new Observable;
            self.interval = interval || 0;
            self.handlerDelegate = bind(self.handler, self);
            self.triggerDelegate = bind(self.trigger, self);

            self.up();
        },

        handler: function(e) {
            var self = this;
            if (self.running) {
                if (e) {
                    self.lastEvent = e;
                }
            }
            else {
                self.next(e);
            }
        },

        next: function(e) {

            var self = this,
                itv = self.interval;

            e = e || self.lastEvent;

            if (!e) {
                return;
            }

            self.lastEvent = null;
            self.running = true;
            self.currentEvent = e;

            if (itv == "raf") {
                raf(self.triggerDelegate);
            }
            else {
                setTimeout(self.triggerDelegate, itv);
            }
        },

        watchWidth: function() {
            this.addWatcher("width", getWidth);
        },

        watchHeight: function() {
            this.addWatcher("width", getHeight);
        },

        watchScrollTop: function() {
            this.addWatcher("scrollTop", getScrollTop);
        },

        watchScrollLeft: function() {
            this.addWatcher("scrollLeft", getScrollLeft);
        },

        addWatcher: function(name, fn, context) {
            this.watchers[name] = {
                fn: fn,
                context: context,
                prev: null,
                current: parseInt(fn.call(context, this.node), 10)
            };
        },

        removeWatcher: function(name) {
            delete this.watchers[name];
        },

        breakFilter: function(l, args, event) {
            var self        = this,
                breakValue  = l.breakValue,
                w           = self.watchers[event.watcher],
                current     = w.current,
                prev        = w.prev,
                min         = Math.min(prev, current),
                max         = Math.max(prev, current);

            args[0].breakPosition = current < breakValue ? -1 : 1;

            return min <= breakValue && breakValue <= max;
        },

        onBreak: function(watcher, breakValue, fn, context, options) {
            var self = this,
                name = watcher + "_" + breakValue;

            options = options || {};
            options.breakValue = breakValue;

            if (!self.breaks[name]) {
                self.breaks[name] = self.observable.createEvent(name, {
                    watcher: watcher,
                    triggerFilter: self.breakFilter,
                    filterContext: self
                });
            }

            self.breaks[name].on(fn, context, options);
        },

        unBreak: function(watcher, breakValue, fn, context) {
            var self = this,
                name = watcher + "_" + breakValue;
            if (self.breaks[name]) {
                self.breaks[name].un(fn, context);
                if (!self.breaks[name].hasListener()) {
                    self.breaks[name].destroy();
                    delete self.breaks[name];
                }
            }
        },

        on: function(fn, context) {
            this.observable.on(this.event, fn, context);
        },

        un: function(fn, context) {
            this.observable.un(this.event, fn, context);
        },

        trigger: function() {
            var self = this,
                e = self.currentEvent,
                ws = self.watchers,
                bs = self.breaks,
                node = self.node,
                w, b;

            self.observable.trigger(self.event, e);

            for (w in ws) {
                ws[w].prev = ws[w].current;
                ws[w].current = parseInt(ws[w].fn.call(ws[w].context, node, e), 10);
            }

            for (b in bs) {
                bs[b].trigger(e);
            }

            self.running = false;
            self.currentEvent = null;

            self.next();
        },

        up: function() {
            var self = this;
            addListener(self.node, self.event, self.handlerDelegate);
        },

        down: function() {
            var self = this;
            removeListener(self.node, self.event, self.handlerDelegate);
        },

        destroy: function() {

            var self = this;

            self.down();
            self.observable.destroy();
            self.queue.destroy();

        }

    }, {
        get: function(node, event, interval) {
            var key = bufferKey(event, interval);

            if (node[key]) {
                return node[key];
            }

            return node[key] = new EventBuffer(node, event, interval);
        }
    });

    return EventBuffer;

}();

