require("metaphorjs-observable/src/lib/Observable.js");
require("../func/dom/addListener.js");
require("../func/dom/removeListener.js");
require("../func/dom/getWidth.js");
require("../func/dom/getHeight.js");
require("../func/dom/getScrollTop.js");
require("../func/dom/getScrollLeft.js");

var bind = require("metaphorjs-shared/src/func/bind.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Allows you to subscribe to a dom event and call handler
 * no sooner than given interval;<br>
 * Also you can subscribe to a specific change: like media query in css.
 * @class MetaphorJs.lib.EventBuffer
 */
module.exports = MetaphorJs.lib.EventBuffer = function(){

    var bufferKey = function(event, interval) {
        return '$$' + event + "_" + interval;
    };

    /**
     * @method EventBuffer
     * @constructor
     * @param {HTMLElement} node 
     * @param {string} event Dom event name
     * @param {int} interval 
     */
    var EventBuffer = function(node, event, interval) {

        var self = this,
            key = bufferKey(event, interval);

        if (node[key]) {
            return node[key];
        }

        node[key] = self;

        self.id = key;
        self.breaks = {};
        self.watchers = {};
        self.node = node;
        self.event = event;
        self.observable = new MetaphorJs.lib.Observable;
        self.interval = interval || 0;
        self.handlerDelegate = bind(self.handler, self);
        self.triggerDelegate = bind(self.trigger, self);

        self.up();
    };

    extend(EventBuffer.prototype, {

        observable: null,
        handlerDelegate: null,
        triggerDelegate: null,
        watchers: null,
        breaks: null,
        running: false,
        lastEvent: null,
        currentEvent: null,
        interval: null,
        id: null,

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

            if (itv === "raf") {
                raf(self.triggerDelegate);
            }
            else {
                setTimeout(self.triggerDelegate, itv);
            }
        },

        /**
         * Shorthand for adding width watcher
         * @method
         */
        watchWidth: function() {
            this.addWatcher("width", MetaphorJs.dom.getWidth);
        },

        /**
         * Shorthand for adding height watcher
         * @method
         */
        watchHeight: function() {
            this.addWatcher("width", MetaphorJs.dom.getHeight);
        },

        /**
         * Shorthand for adding scrolltop watcher
         * @method
         */
        watchScrollTop: function() {
            this.addWatcher("scrollTop", MetaphorJs.dom.getScrollTop);
        },

        /**
         * Shorthand for adding scrollleft watcher
         * @method
         */
        watchScrollLeft: function() {
            this.addWatcher("scrollLeft", MetaphorJs.dom.getScrollLeft);
        },

        /**
         * Add your own watcher
         * @method
         * @param {string} name Watcher name
         * @param {function} fn {
         *  @param {HTMLElement} node
         * }
         * @param {object} context fn's context
         */
        addWatcher: function(name, fn, context) {
            if (!this.watchers[name]) {
                this.watchers[name] = {
                    fn:      fn,
                    context: context,
                    prev:    null,
                    current: parseInt(fn.call(context, this.node), 10)
                };
            }
        },

        /**
         * Remove watcher
         * @method
         * @param {string} name
         */
        removeWatcher: function(name) {
            delete this.watchers[name];
        },

        breakFilter: function(l, args, event) {

            if (!this.watchers[event.watcher]) {
                return false;
            }

            var self        = this,
                breakValue  = l.breakValue,
                luft        = l.breakLuft || 0,
                lowLuft     = l.breakLowLuft || luft,
                highLuft    = l.breakHighLuft || luft,
                lowBreak    = breakValue - lowLuft,
                highBreak   = breakValue + highLuft,
                w           = self.watchers[event.watcher],
                current     = w.current,
                prev        = w.prev,
                min         = Math.min(prev, current),
                max         = Math.max(prev, current);

            if (breakValue === "!=") {
                return prev != current;
            }

            args[0].breakPosition = current < lowBreak ? -1 :  (current >= highBreak ? 1 : 0);

            return (min <= lowBreak && lowBreak <= max) ||
                    (min <= highBreak && highBreak <= max);
        },


        /**
         * Add break listener (media query stop)
         * @method
         * @param {string} watcher Watcher name
         * @param {int} breakValue 
         * @param {function} fn {
         *  Listener function
         *  @param {Event} event Native dom event
         * }
         * @param {object} context fn's context
         * @param {object} options Options are passed to 
         * MetaphorJs.lib.Observable.on()
         */
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

        /**
         * Unsubscribe from a break
         * @method
         * @param {string} watcher Watcher name
         * @param {int} breakValue 
         * @param {function} fn
         * @param {object} context fn's context
         * @param {boolean} destroy Destroy if there are no more listeners
         */
        unBreak: function(watcher, breakValue, fn, context, destroy) {
            var self = this,
                name = watcher + "_" + breakValue;
            if (self.breaks[name]) {
                self.breaks[name].un(fn, context);
                if (!self.breaks[name].hasListener()) {
                    self.observable.destroyEvent(name);
                    self.breaks[name] = null;
                    delete self.breaks[name];
                }
            }
            if (destroy) {
                self.destroyIfIdle();
            }
        },

        /**
         * Subscribe to dom event
         * @method
         * @param {function} fn {
         *  @param {Event} event 
         * }
         * @param {object} context fn's context
         * @param {object} options Observable's options
         */
        on: function(fn, context, options) {
            this.observable.on(this.event, fn, context, options);
        },

        /**
         * Ubsubscribe from dom event
         * @method
         * @param {function} fn 
         * @param {object} context fn's context
         * @param {boolean} destroy Destroy if there are no more listeners
         */
        un: function(fn, context, destroy) {
            var self = this;
            self.observable.un(self.event, fn, context);
            if (destroy) {
                self.destroyIfIdle();
            }
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

        /**
         * Start listening to DOM event. (Called automatically from constructor)
         * @method
         */
        up: function() {
            var self = this;
            MetaphorJs.dom.addListener(self.node, self.event, self.handlerDelegate);
        },

        /**
         * Stop listening to DOM event
         * @method
         */
        down: function() {
            var self = this;
            MetaphorJs.dom.removeListener(self.node, self.event, self.handlerDelegate);
        },

        /**
         * Destroy if there are no listeners
         * @method
         */
        destroyIfIdle: function() {
            if (this.observable && !this.observable.hasListener()) {
                this.$destroy();
                return true;
            }
        },

        /**
         * @method
         */
        $destroy: function() {

            var self = this;

            delete self.node[self.id];

            self.down();
            self.observable.$destroy();

        }
    });


    /**
     * Get existing event buffer
     * @method get
     * @static
     * @param {HTMLElement} node 
     * @param {string} event 
     * @param {int} interval 
     * @returns {MetaphorJs.lib.EventBuffer}
     */
    EventBuffer.get = function(node, event, interval) {
        var key = bufferKey(event, interval);

        if (node[key]) {
            return node[key];
        }

        return node[key] = new EventBuffer(node, event, interval);
    
    };

    return EventBuffer;
}();

