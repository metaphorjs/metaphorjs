
require("../func/dom/addListener.js");
require("../func/dom/removeListener.js");
require("../func/dom/normalizeEvent.js");
require("../func/dom/is.js");
require("./EventBuffer.js");
require("./Expression.js");
require("./MutationObserver.js");

const extend = require("metaphorjs-shared/src/func/extend.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Handles events as they come defined in html templates
 * @class MetaphorJs.lib.EventHandler
 */

/**
 * @method EventHandler
 * @constructor
 * @param {string} event Dom event name
 * @param {MetaphorJs.lib.State} state 
 * @param {HTMLElement} node 
 * @param {MetaphorJs.lib.Config} cfg MetaphorJs.lib.Config
 */
MetaphorJs.lib.EventHandler = function(event, state, node, cfg) {

    var self = this;

    self.config     = cfg;
    self.event      = event;
    self.prevEvent  = {};
    self.state      = state;
    self.node       = node;
    self.handler    = null;
    self.buffer     = null;

    if (cfg.hasExpression("if")) {
        cfg.on("if", self.onIfChange, self);
    }

    self.up();
};

extend(MetaphorJs.lib.EventHandler.prototype, {

    $destroyed: false,
    $destroying: false,

    onIfChange: function(val) {
        this[val?"up":"down"]();
    },

    createHandler: function() {

        var self        = this,
            state       = self.state,
            config      = self.config,
            asnc;

        var handler = function(e) {

            if (self.$destroyed || self.$destroying) {
                return;
            }

            var keyCode,
                preventDefault = false,
                returnValue = undefined,
                stopPropagation = false,
                stopImmediate = false,
                res,
                cfg = config.getAll(),
                not = cfg.not,
                handlers = [],
                names = [],
                skipHandler = false,
                handler, i, l;

            config.eachProperty(function(name){
                if (name.indexOf("value") === 0) {
                    handlers.push(config.get(name));
                    names.push(name);
                }
            });

            cfg.preventDefault !== undefined && (preventDefault = cfg.preventDefault);
            cfg.stopPropagation !== undefined && (stopPropagation = cfg.stopPropagation);
            cfg.stopImmediatePropagation !== undefined && 
                (stopImmediate = cfg.stopImmediatePropagation);
            cfg.returnValue !== undefined && (returnValue = cfg.returnValue);
            cfg.keyCode !== undefined && (keyCode = cfg.keyCode);

            e = MetaphorJs.dom.normalizeEvent(e || window.event);

            if (not) {
                if (!isArray(not)) {
                    not = [not];
                }
                var prnt;
                nt:
                for (i = 0, l = not.length; i < l; i++) {
                    prnt = e.target;
                    while (prnt && prnt !== self.node) {
                        if (MetaphorJs.dom.is(prnt, not[i])) {
                            skipHandler = true;
                            break nt;
                        }
                        prnt = prnt.parentNode;
                    }
                }
            }

            if (keyCode) {
                if (typeof keyCode === "number" && keyCode !== e.keyCode) {
                    return null;
                }
                else if (keyCode.indexOf(e.keyCode) === -1) {
                    return null;
                }
            }

            state.$event = e;
            state.$eventNode = self.node;
            state.$prevEvent = self.prevEvent[e.type];
            state.$eventCmp = config.get("targetComponent");

            if (!skipHandler && handlers.length > 0) {
                for (i = 0, l = handlers.length; i < l; i++) {
                    handler = handlers[i];
                    res = handler.call(cfg.context || null, state);

                    if (res && isPlainObject(res)) {
                        res.preventDefault !== undefined && 
                            (preventDefault = res.preventDefault);
                        res.stopPropagation !== undefined && 
                            (stopPropagation = res.stopPropagation);
                        res.returnValue !== undefined && 
                            (returnValue = res.returnValue);
                    }
                }
            }

            stopPropagation && e.stopPropagation();
            stopImmediate && e.stopImmediatePropagation && e.stopImmediatePropagation();
            preventDefault && e.preventDefault();

            if (self.$destroyed || self.$destroying) {
                return returnValue !== undefined ? returnValue : undefined;
            }

            state.$event = null;
            state.$eventNode = null;
            state.$eventCmp = null;

            self.prevEvent[e.type] = e;

            for (i = 0, l = names.length; i < l; i++) {
                config.checkState(names[i]);
            }

            if (returnValue !== undefined) {
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
                self.buffer = MetaphorJs.lib.EventBuffer.get(
                    self.node, self.event, buffer,
                    self._getEventConfig()
                );
                self.buffer.on(self.handler);
            }
            else {
                MetaphorJs.dom.addListener(
                    self.node, 
                    self.event, 
                    self.handler,
                    self._getEventConfig()
                );
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

    _getEventConfig: function() {
        var opts = {};
        if (this.config.hasExpression("passive")) {
            opts.passive = this.config.get("passive");
        }
        return opts;
    },

    /**
     * @method
     */
    $destroy: function() {
        var self = this;
        if (self.$destroyed || self.$destroying) {
            return;
        }
        self.$destroying = true;
        self.down();
        self.config.clear();
        self.$destroying = false;
        self.$destroyed = true;
    }
});

module.exports = MetaphorJs.lib.EventHandler;