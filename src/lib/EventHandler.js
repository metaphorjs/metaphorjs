
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    addListener = require("../func/event/addListener.js"),
    removeListener = require("../func/event/removeListener.js"),
    trim = require("../func/trim.js"),
    undf = require("../var/undf.js"),
    normalizeEvent = require("../func/event/normalizeEvent.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js");

module.exports = defineClass({

    cfg: null,
    scope: null,
    node: null,
    listeners: null,
    event: null,

    $init: function(scope, node, cfg, event) {

        var self = this,
            tmp;

        self.event = event;

        cfg = cfg || {};

        if (typeof cfg == "string") {

            var fc = cfg.substr(0,1);

            if (fc == '{') {
                self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
                cfg = self.watcher.getLastResult();
            }
            else if (fc == '=') {
                cfg = cfg.substr(1);
                self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
                cfg = self.watcher.getLastResult();
            }
            else {
                var handler = createGetter(cfg);
                cfg = {
                    handler: handler
                };
            }
        }

        self.prepareConfig(cfg);

        self.listeners  = [];
        self.scope      = scope;
        self.node       = node;

        self.up();
    },

    prepareConfig: function(cfg) {

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

        this.cfg = cfg;
    },

    onConfigChange: function(val) {
        var self = this;
        self.down();
        self.prepareConfig(val);
        self.up();
    },

    createHandler: function(cfg) {

        var scope = this.scope;

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

            if (cfg.handler) {
                cfg.handler.call(cfg.context || null, scope);
            }

            scope.$event = null;

            scope.$root.$check();

            stopPropagation && e.stopPropagation();
            preventDefault && e.preventDefault();

            return returnValue;
        };
    },

    up: function() {

        var self    = this,
            cfg     = self.cfg,
            ls      = self.listeners,
            node    = self.node,
            handler,
            event;

        for (event in cfg) {
            if (cfg.if === undf || cfg.if) {
                handler = self.createHandler(cfg[event]);
                ls.push([event, handler]);
                addListener(node, event, handler);
            }
        }
    },

    down: function() {

        var self    = this,
            ls      = self.listeners,
            node    = self.node,
            i, l;

        for (i = 0, l = ls.length; i < l; i++) {
            removeListener(node, ls[i][0], ls[i][1]);
        }

        self.listeners = [];
    },

    destroy: function() {
        var self = this;
        self.down();
        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onConfigChange, self);
        }
    }

});