
require("../func/dom/addListener.js");
require("../func/dom/removeListener.js");
require("../func/dom/normalizeEvent.js");
require("./EventBuffer.js");
require("./Expression.js");

var undf = require("metaphorjs-shared/src/var/undf.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Handles events as they come defined in html templates
 * @class MetaphorJs.lib.EventHandler
 */

/**
 * @method EventHandler
 * @constructor
 * @param {MetaphorJs.lib.Scope} scope 
 * @param {DomNode} node 
 * @param {object} cfg Directive config
 * @param {string} event Dom event name
 * @param {object} defaults Default config
 */
MetaphorJs.lib.EventHandler = function(scope, node, cfg, event, defaults) {

    var self = this;

    self.event = event;
    self.prevEvent = {};

    defaults = defaults || {};

    cfg = cfg || {};

    if (typeof cfg === "string") {

        self.updateRoot = cfg.indexOf('$root') + cfg.indexOf('$parent') !== -2;

        var fc = cfg.substr(0,1);

        if (fc === '{') {
            self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
            cfg = extend({}, self.watcher.getLastResult(), true, true);
        }
        else if (fc === '=') {
            cfg = cfg.substr(1);
            self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
            cfg = extend({}, self.watcher.getLastResult(), true, true);
        }
        else {
            var handler = MetaphorJs.lib.Expression.parse(cfg);
            cfg = {
                handler: handler
            };
        }
    }

    self.buffers    = {};
    self.listeners  = [];
    self.scope      = scope;
    self.node       = node;

    self.prepareConfig(cfg, defaults);

    self.up();
};

extend(MetaphorJs.lib.EventHandler.prototype, {

    cfg: null,
    scope: null,
    node: null,
    listeners: null,
    event: null,
    buffers: null,
    updateRoot: false,
    prevEvent: null,

    prepareConfig: function(cfg, defaults) {

        var tmp,
            event = this.event;

        extend(cfg, defaults, false, false);

        if (cfg.handler && typeof cfg.handler === "string") {
            cfg.handler = MetaphorJs.lib.Expression.parse(cfg.handler);
        }

        if (cfg.event) {
            tmp = {};
            var events = cfg.event.split(","),
                i, l;

            for (i = 0, l = events.length; i < l; i++) {
                tmp[events[i].trim()] = cfg;
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
        val = extend({}, val, true, true);
        self.down();
        self.prepareConfig(val);
        self.up();
    },

    createHandler: function(cfg, scope) {

        var self        = this,
            updateRoot  = self.updateRoot;

        var handler = function(e){

            if (self.$destroyed || self.$destroying) {
                return;
            }

            var keyCode,
                preventDefault = false,
                returnValue = undf,
                stopPropagation = false,
                res;

            cfg.preventDefault !== undf && (preventDefault = cfg.preventDefault);
            cfg.stopPropagation !== undf && (stopPropagation = cfg.stopPropagation);
            cfg.returnValue !== undf && (returnValue = cfg.returnValue);
            cfg.keyCode !== undf && (keyCode = cfg.keyCode);

            e = MetaphorJs.dom.normalizeEvent(e || window.event);

            if (keyCode) {
                if (typeof keyCode === "number" && keyCode !== e.keyCode) {
                    return null;
                }
                else if (keyCode.indexOf(e.keyCode) === -1) {
                    return null;
                }
            }

            scope.$event = e;
            scope.$eventNode = self.node;
            scope.$prevEvent = self.prevEvent[e.type];

            if (cfg.handler) {
                res = cfg.handler.call(cfg.context || null, scope);

                if (res && isPlainObject(res)) {
                    res.preventDefault !== undf && (preventDefault = res.preventDefault);
                    res.stopPropagation !== undf && (stopPropagation = res.stopPropagation);
                    res.returnValue !== undf && (returnValue = res.returnValue);
                }
            }

            stopPropagation && e.stopPropagation();
            preventDefault && e.preventDefault();

            if (self.$destroyed || self.$destroying) {
                return returnValue !== undf ? returnValue : undf;
            }

            scope.$event = null;
            scope.$eventNode = null;

            self.prevEvent[e.type] = e;

            updateRoot ? scope.$root.$check() : scope.$check();

            if (returnValue !== undf) {
                return returnValue;
            }
        };

        if (cfg.async) {
            return function(e) {
                async(handler, null, [e], 
                        typeof cfg.async == "number" ? cfg.async : null);
            };
        }
        else {
            return handler;
        }
    },

    /**
     * Start listening to event
     * @method
     */
    up: function() {

        var self    = this,
            allCfg  = self.cfg,
            ls      = self.listeners,
            bs      = self.buffers,
            node    = self.node,
            scope   = self.scope,
            cfg,
            buffer,
            handler,
            event;

        for (event in allCfg) {
            cfg = allCfg[event];
            buffer = cfg.buffer;

            if (cfg['if'] === undf || cfg['if']) {
                handler = self.createHandler(cfg, scope);
                ls.push([event, handler]);

                if (buffer) {
                    if (!bs[event]) {
                        bs[event] = MetaphorJs.lib.EventBuffer.get(node, event, buffer);
                        bs[event].on(handler);
                    }
                }
                else {
                    MetaphorJs.dom.addListener(node, event, handler);
                }
            }
        }
    },

    /**
     * Stop listening to event
     * @method
     */
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
                MetaphorJs.dom.removeListener(node, event, handler);
            }
        }

        self.listeners  = [];
    },

    /**
     * @method
     */
    $destroy: function() {
        var self = this;
        self.down();
        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onConfigChange, self);
        }
    }
});

module.exports = MetaphorJs.lib.EventHandler;