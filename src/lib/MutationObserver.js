

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

module.exports = MetaphorJs.lib.MutationObserver = (function(){

    var observable = new MetaphorJs.lib.Observable;

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
        }

        if (dataObj) {
            if (!dataObj["$$mo"]) {
                dataObj.$$mo = {};
            }
            dataObj.$$mo[expr] = self;
        }

        self.currentValue = self.getterFn(dataObj);
        self.type = type;
    };

    extend(MutationObserver.prototype, {

        propertyGetter: function() {
            return this.dataObj[this.propertyName];
        },

        staticGetter: function() {
            return this.staticValue;
        },

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

        getValue: function() {
            return this.currentValue;
        },

        setValue: function(newValue) {  
            this.setterFn(this.dataObj, newValue);
        },

        getPrevValue: function() {
            return this.prevValue;
        },

        subscribe: function(fn, context, opt) {
            opt = opt || {};
            opt.allowDupes = true;
            observable.on(this.id, fn, context, opt);
        },

        unsubscribe: function(fn, context) {
            observable.un(this.id, fn, context);
        },

        $destroy: function() {

        }
    });

    MutationObserver.get = function(dataObj, expr, listener, context) {

        expr = expr.trim();

        if (dataObj && dataObj.$$mo && dataObj.$$mo[expr]) {
            var mo = dataObj.$$mo[expr];
            if (listener) {
                mo.subscribe(listener, context);
            }
            return mo;
        }
        return new MutationObserver(dataObj, expr, listener, context);
    };

    MutationObserver.$destroy = function(dataObj, expr) {

    }

    return MutationObserver;

}());