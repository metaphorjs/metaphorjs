
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    addListener = require("../func/event/addListener.js"),
    removeListener = require("../func/event/removeListener.js"),
    trim = require("../func/trim.js"),
    undf = require("../var/undf.js"),
    extend = require("../func/extend.js"),
    normalizeEvent = require("../func/event/normalizeEvent.js"),
    EventBuffer = require("./EventBuffer.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js");

module.exports = defineClass({

    cfg: null,
    scope: null,
    node: null,
    listeners: null,
    event: null,
    buffers: null,
    updateRoot: false,

    $init: function(scope, node, cfg, event, defaults) {

        var self = this;

        self.event = event;

        defaults = defaults || {};

        cfg = cfg || {};

        if (typeof cfg == "string") {

            self.updateRoot = cfg.indexOf('$root') + cfg.indexOf('$parent') != -2;

            var fc = cfg.substr(0,1);

            if (fc == '{') {
                self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
                cfg = extend({}, self.watcher.getLastResult(), true, true);
            }
            else if (fc == '=') {
                cfg = cfg.substr(1);
                self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
                cfg = extend({}, self.watcher.getLastResult(), true, true);
            }
            else {
                var handler = createGetter(cfg);
                cfg = {
                    handler: handler
                };
            }
        }

        self.prepareConfig(cfg, defaults);

        self.buffers    = {};
        self.listeners  = [];
        self.scope      = scope;
        self.node       = node;

        self.up();
    },

    prepareConfig: function(cfg, defaults) {

        var tmp,
            event = this.event;

        if (cfg.event) {
            tmp = {};
            var events = cfg.event.split(","),
                i, l;

            delete cfg.event;

            for (i = 0, l = events.length; i < l; i++) {
                tmp[trim(events[i])] = cfg;
            }

            cfg = tmp;
        }
        else if (event) {
            tmp = {};
            tmp[event] = cfg;
            cfg = tmp;
        }

        extend(cfg, defaults, false, false);

        this.cfg = cfg;
    },

    onConfigChange: function(val) {
        var self = this;
        val = extend({}, val, true, true);
        self.down();
        self.prepareConfig(val);
        self.up();
    },

    createHandler: function(cfg, scope) {

        var updateRoot = this.updateRoot;

        return function(e){

            var keyCode,
                preventDefault = true,
                returnValue = false,
                stopPropagation = false;

            cfg.preventDefault !== undf && (preventDefault = cfg.preventDefault);
            cfg.stopPropagation !== undf && (stopPropagation = cfg.stopPropagation);
            cfg.returnValue !== undf && (returnValue = cfg.returnValue);
            cfg.keyCode !== undf && (keyCode = cfg.keyCode);

            e = normalizeEvent(e || window.event);

            if (keyCode) {
                if (typeof keyCode == "number" && keyCode != e.keyCode) {
                    return null;
                }
                else if (keyCode.indexOf(e.keyCode) == -1) {
                    return null;
                }
            }

            scope.$event = e;
            scope.$eventNode = self.node;

            if (cfg.handler) {
                cfg.handler.call(cfg.context || null, scope);
            }

            scope.$event = null;
            scope.$eventNode = null;

            updateRoot ? scope.$root.$check() : scope.$check();

            stopPropagation && e.stopPropagation();
            preventDefault && e.preventDefault();

            return returnValue;
        };
    },

    up: function() {

        var self    = this,
            cfg     = self.cfg,
            ls      = self.listeners,
            bs      = self.buffers,
            node    = self.node,
            scope   = self.scope,
            buffer  = cfg.buffer,
            handler,
            event;

        for (event in cfg) {
            if (cfg.if === undf || cfg.if) {
                handler = self.createHandler(cfg[event], scope);
                ls.push([event, handler]);

                if (buffer) {
                    if (!bs[event]) {
                        bs[event] = EventBuffer.get(node, event, buffer);
                        bs[event].on(handler);
                    }
                }
                else {
                    addListener(node, event, handler);
                }
            }
        }
    },

    down: function() {

        var self    = this,
            ls      = self.listeners,
            bs      = self.buffers,
            node    = self.node,
            buffer  = self.cfg.buffer,
            event,
            handler,
            i, l;


        for (i = 0, l = ls.length; i < l; i++) {
            event = ls[i][0];
            handler = ls[i][1];
            if (buffer) {
                bs[event].un(handler);
                if (bs[event].destroyIfIdle() === true) {
                    delete bs[event];
                }
            }
            else {
                removeListener(node, event, handler);
            }
        }

        self.listeners  = [];
    },

    destroy: function() {
        var self = this;
        self.down();
        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onConfigChange, self);
        }
    }

});