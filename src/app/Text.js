
require("metaphorjs-observable/src/lib/Observable.js");
require("../lib/MutationObserver.js");
require("../lib/Expression.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");

/**
 * Text renderer
 * @class MetaphorJs.app.Text
 */
module.exports = MetaphorJs.app.Text = (function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        events                  = new MetaphorJs.lib.Observable,

        _process                = function(text, scope, observers) {

            var index       = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                expr,
                w,
                result      = "";

            while (index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) !== -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) !== -1) &&
                    text.substr(startIndex - 1, 1) !== '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex !== startIndex + startSymbolLength) {
                        expr = text.substring(startIndex + startSymbolLength, endIndex);
                        expr = expr.trim();

                        if (observers) {
                            w = MetaphorJs.lib.MutationObserver.get(scope, expr);
                            result += w.getValue();
                            observers.push(w);
                        }
                        else {
                            result += MetaphorJs.lib.Expression.run(expr, scope)
                        }
                    }

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }

            return result;
        },

        render                  = function(text, scope, observers, recursive) {

            var result,
                prev = text,
                iter = 0;

            while (true) {
                if (iter > 100) {
                    throw new Error(
                        "Got more than 100 iterations on template: " + self.origin);
                }
                result = _process(prev, scope, observers);
                if (!recursive || result === prev) {
                    return result;
                }
                prev = result;
                iter++;
            }
        };


    /**
     * @constructor
     * @method
     * @param {object} dataObj
     * @param {string} text 
     * @param {object} opt {
     *  @type {bool} recursive
     * }
     */
    var Text = function(scope, text, opt) {
        opt = opt || {};

        var self        = this;

        self.id         = nextUid();
        self.origin     = text;
        self.text       = "";
        self.scope      = scope;
        self.destroyed  = false;

        if (opt.recursive === true || opt.recursive === false) {
            self.recursive = opt.recursive;
        }

        self._processDelegate = bind(self._process, self);
        self.observers  = [];

        self._process(true);
    };

    extend(Text.prototype, {

        _process: function(initial) {

            if (this.destroyed) {
                return;
            }

            var self = this,
                obs = self.observers.slice();

            self._observeData(obs, "unsubscribe");
            self.observers = [];

            self.text = render(self.origin, self.scope, 
                                self.observers, self.recursive);

            self._observeData(self.observers, "subscribe");
            self._destroyObservers(obs);

            if (!initial) {
                events.trigger(self.id, self);
            }
        },

        _onDataChange: function() {
            async(self._processDelegate);
        },

        _observeData: function(obs, mode) {
            var i, l;
            for (i = 0, l = obs.length; i < l; i++) {
                // subscribe/unsubscribe
                obs[i][mode](self._onDataChange, self);
            }
        },

        _destroyObservers: function(obs) {
            var i, l;
            for (i = 0, l = obs.length; i < l; i++) {
                obs[i].$destroy(true);
            }
        },

        getString: function() {
            return this.text;
        },

        subscribe: function(fn, context) {
            return events.on(this.id, fn, context);
        },

        unsubscribe: function(fn, context) {
            return events.un(this.id, fn, context);
        },

        $destroy: function() {
            var self = this;
            self.destroyed  = true;
            events.destroyEvent(self.id);
            self._observeData(self.observers, "unsubscribe");
            self._destroyObservers(self.observers);
        }
    });

    Text.render = render;

    return Text;
}());