

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    isFunction = require("metaphorjs-shared/src/func/isFunction.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    equals = require("metaphorjs-shared/src/func/equals.js"),
    copy = require("metaphorjs-shared/src/func/copy.js");

require("metaphorjs-observable/src/lib/Observable.js");
require("./Expression.js");

/**
 * @class MetaphorJs.lib.MutationObserver
 */
module.exports = MetaphorJs.lib.MutationObserver = (function(){

    var observable = new MetaphorJs.lib.Observable;

    var checkAll = function() {
        var k, changes = 0;
        for (k in this) {
            if (this.hasOwnProperty(k) && k !== "$checkAll") {
                if (this[k].check()){
                    changes++;
                }
            }
        }
        return changes;
    };

    /**
     * @constructor
     * @method
     * @param {object} dataObj Data object to run expression against
     * @param {string|function} expr Code expression or property name or getter function
     * @param {function} listener {
     *  @param {*} currentValue
     *  @param {*} prevValue
     * }
     * @param {object} context Listener's context
     * @param {object} opt {
     *  @type {array|object} filters {
     *      Either one filter source or array of filter sources
     *  }
     * }
     */
    var MutationObserver = function(dataObj, expr, listener, context, opt) {

        var self    = this,
            id      = nextUid(),
            type    = "expr",
            propertyName,
            static;

        opt = opt || {};

        if (listener) {
            observable.on(id, listener, context, {
                allowDupes: true
            });
        }

        self.id = id;
        self.origExpr = expr;
        self.propertyName = null;
        self.staticValue = null;
        self.dataObj = null;
        self.currentValue = null;
        self.prevValue = null;
        self.setterFn = null;
        self.getterFn = null;
        self.exprStruct = null;

        if (isFunction(expr)) {
            self.getterFn = expr;
        }
        else if (static = MetaphorJs.lib.Expression.isStatic(expr)) {
            type = "static";
            self.staticValue = static.value;
            self.getterFn = bind(self.staticGetter, self);
        }
        else if (dataObj) {
            propertyName = expr;
            if (dataObj.hasOwnProperty(propertyName) || 
                ((propertyName = MetaphorJs.lib.Expression.isProperty(expr)) &&
                dataObj.hasOwnProperty(propertyName))) {
                    type = "attr";
                    self.propertyName = propertyName;
                    self.getterFn = bind(self.propertyGetter, self);
                }
            self.dataObj = dataObj;
        }
        
        if (!self.getterFn && type === "expr") {

            if (!opt.filters) {
                opt.filters = dataObj;
            }
            else {
                if (!isArray(opt.filters)) {
                    opt.filters = [opt.filters];
                }
                else {
                    opt.filters.push(dataObj);
                }
            }

            var struct = MetaphorJs.lib.Expression.deconstruct(expr, {
                filters: opt.filters
            });

            self.getterFn = MetaphorJs.lib.Expression.construct(
                struct, {getterOnly: true}
            );

            if (struct.inputPipes.length) {
                self.setterFn = MetaphorJs.lib.Expression.construct(
                    struct, {setterOnly: true}
                );
            }

            self.exprStruct = struct;
        }

        if (dataObj) {
            if (!dataObj["$$mo"]) {
                dataObj.$$mo = {
                    $checkAll: checkAll
                };
            }
            dataObj.$$mo[expr] = self;
        }

        self.currentValue = copy(self.getterFn(dataObj));
        self.type = type;
    };

    extend(MutationObserver.prototype, {

        propertyGetter: function() {
            return this.dataObj[this.propertyName];
        },

        staticGetter: function() {
            return this.staticValue;
        },

        /**
         * Check for changes
         * @method
         * @returns {boolean} true for changes
         */
        check: function() {

            var self = this,
                curr = self.currentValue,
                val = self._getValue();

            if (!equals(val, curr)) {
                self.prevValue = curr;
                self.currentValue = copy(val);
                observable.trigger(self.id, self.currentValue, curr);
                return true;
            }

            return false;
        },

        _getValue: function() {
            return this.getterFn(this.dataObj);
        },

        /**
         * Get current value of expression
         * @method
         * @returns {*}
         */
        getValue: function() {
            return this.currentValue;
        },

        /**
         * If the expression uses input pipes, use this method to trigger them
         * @method
         * @param {*} newValue 
         * @returns {*} resulting value
         */
        setValue: function(newValue) {  
            return this.setterFn(this.dataObj, newValue);
        },

        /**
         * Get previous value
         * @method
         * @returns {*}
         */
        getPrevValue: function() {
            return this.prevValue;
        },

        /**
         * 
         * @param {function} fn {
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt See MetaphorJs.lib.Observable.on()
         * @returns {MetaphorJs.lib.MutationObserver} self
         */
        subscribe: function(fn, context, opt) {
            opt = opt || {};
            opt.allowDupes = true;
            observable.on(this.id, fn, context, opt);
            return this;
        },

        /**
         * Unsubscribe from changes event
         * @param {function} fn 
         * @param {object} context 
         * @returns {MetaphorJs.lib.MutationObserver} self
         */
        unsubscribe: function(fn, context) {
            observable.un(this.id, fn, context);
            return this;
        },

        /**
         * Does the expression have input pipes
         * @method
         * @returns {boolean}
         */
        hasInputPipes: function() {
            return this.exprStruct && this.exprStruct.inputPipes.length > 0;
        },

        /**
         * Does the expression have output pipes
         * @method
         * @returns {boolean}
         */
        hasOutputPipes: function() {
            return this.exprStruct && this.exprStruct.pipes.length > 0;
        },

        /**
         * Destroy observer
         * @param {boolean} ifUnobserved 
         * @returns {boolean} true for destroyed
         */
        $destroy: function(ifUnobserved) {
            var self = this;
            if (ifUnobserved && observable.hasListener(self.id)) {
                return false;
            }
            observable.destroyEvent(self.id);
            if (self.dataObj && self.dataObj['$$mo']) {
                delete self.dataObj['$$mo'][self.origExpr];
            }
            for (var key in self) {
                if (self.hasOwnProperty(key)) {
                    self[key] = null;
                }
            }
            return true;
        }
    });


    /**
     * Check data object for changes
     * @static
     * @method
     * @param {object} dataObj
     * @param {string} expr {
     *  Optional expression 
     *  @optional
     * }
     * @returns {bool|int} Either true|false for specific expression or number of changes
     */
    MutationObserver.check = function(dataObj, expr)  {
        var mo;
        if (expr) {
            mo = MutationObserver.exists(dataObj, expr);
            if (!mo) {
                throw new Error("MutationObserver not found for expression: " + expr);
            }
            return mo.check();
        }
        if (!dataObj.$$mo) {
            return false;
        }
        return dataObj.$$mo.$checkAll();
    };

    /**
     * See the constructor parameters
     * @static
     * @method
     */
    MutationObserver.get = function(dataObj, expr, listener, context, opt) {

        expr = expr.trim();
        var mo = MutationObserver.exists(dataObj, expr);

        if (mo) {
            if (listener) {
                mo.subscribe(listener, context);
            }
            return mo;
        }

        return new MutationObserver(dataObj, expr, listener, context, opt);
    };

    /**
     * Check if mutation observer exists on the object and return it or false
     * @static
     * @method
     * @param {object} dataObj
     * @param {string} expr
     * @returns {MetaphorJs.lib.MutationObserver|boolean}
     */
    MutationObserver.exists = function(dataObj, expr) {
        expr = expr.trim();

        if (dataObj && dataObj.$$mo && dataObj.$$mo[expr]) {
            return dataObj.$$mo[expr];
        }

        return false;
    };

    /**
     * Destroy an observer
     * @static
     * @method
     * @param {object} dataObj
     * @param {string|null} expr If null, destroy all observers on this object
     * @param {boolean} ifUnobserved Destroy only if unobserved
     */
    MutationObserver.$destroy = function(dataObj, expr, ifUnobserved) {

        var key, all = true;

        if (dataObj && dataObj.$$mo) {
            for (key in dataObj.$$mo) {
                if (dataObj.$$mo.hasOwnProperty(key) && 
                    (!expr || key === expr) &&
                    key[0] !== '$') {
                    if (dataObj.$$mo[key].$destroy(ifUnobserved)) {
                        delete dataObj.$$mo[key];
                    }
                    else all = false;
                }
            }

            if (all) {
                delete dataObj.$$mo;
            }
        }
    }

    return MutationObserver;

}());