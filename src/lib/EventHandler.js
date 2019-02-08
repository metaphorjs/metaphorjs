
require("../func/dom/addListener.js");
require("../func/dom/removeListener.js");
require("../func/dom/normalizeEvent.js");
require("./EventBuffer.js");
require("./Expression.js");
require("./MutationObserver.js");

var undf = require("metaphorjs-shared/src/var/undf.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Handles events as they come defined in html templates
 * @class MetaphorJs.lib.EventHandler
 */

/**
 * @method EventHandler
 * @constructor
 * @param {string} event Dom event name
 * @param {MetaphorJs.lib.Scope} scope 
 * @param {HTMLElement} node 
 * @param {MetaphorJs.lib.Config} cfg MetaphorJs.lib.Config
 */
MetaphorJs.lib.EventHandler = function(event, scope, node, cfg) {

    var self = this;

    self.config     = cfg;
    self.event      = event;
    self.prevEvent  = {};
    self.scope      = scope;
    self.node       = node;
    self.handler    = null;
    self.buffer     = null;

    if (cfg.hasExpression("if")) {
        cfg.on("if", self.onIfChange, self);
    }

    self.up();
};

extend(MetaphorJs.lib.EventHandler.prototype, {


    onIfChange: function(val) {
        this[val?"up":"down"]();
    },

    createHandler: function() {

        var self        = this,
            scope       = self.scope,
            config      = self.config,
            asnc;

        var handler = function(e) {

            if (self.$destroyed || self.$destroying) {
                return;
            }

            var keyCode,
                preventDefault = false,
                returnValue = undf,
                stopPropagation = false,
                res,
                cfg = config.getAll(),
                handlers = [],
                names = [],
                handler, i, l;

            config.eachProperty(function(name){
                if (name.indexOf("value") === 0) {
                    handlers.push(config.get(name));
                    names.push(name);
                }
            });

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
            scope.$eventCmp = config.get("targetComponent");

            if (handlers.length > 0) {
                for (i = 0, l = handlers.length; i < l; i++) {
                    handler = handlers[i];
                    res = handler.call(cfg.context || null, scope);

                    if (res && isPlainObject(res)) {
                        res.preventDefault !== undf && 
                            (preventDefault = res.preventDefault);
                        res.stopPropagation !== undf && 
                            (stopPropagation = res.stopPropagation);
                        res.returnValue !== undf && 
                            (returnValue = res.returnValue);
                    }
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

            for (i = 0, l = names.length; i < l; i++) {
                config.checkScope(names[i]);
            }

            if (returnValue !== undf) {
                return returnValue;
            }
        };

        if (asnc = self.config.get("async")) {
            return function(e) {
                async(handler, null, [e], 
                        typeof asnc == "number" ? asnc : null);
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
            cfg     = self.config,
            buffer  = cfg.get("buffer");

        if (!cfg.hasExpression("if") || cfg.get('if')) {
            self.handler = self.createHandler();

            if (buffer) {
                self.buffer = MetaphorJs.lib.EventBuffer.get(self.node, self.event, buffer);
                self.buffer.on(self.handler);
            }
            else {
                MetaphorJs.dom.addListener(self.node, self.event, self.handler);
            }
        }
    },

    /**
     * Stop listening to event
     * @method
     */
    down: function() {

        var self    = this;

        if (self.buffer) {
            self.buffer.un(self.handler);
            self.buffer.destroyIfIdle();
            self.buffer = null;
        }
        else {
            MetaphorJs.dom.removeListener(self.node, self.event, self.handler);
        }
    },

    /**
     * @method
     */
    $destroy: function() {
        var self = this;
        self.down();
        self.config.clear();
    }
});

module.exports = MetaphorJs.lib.EventHandler;