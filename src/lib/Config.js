require("metaphorjs-observable/src/lib/Observable.js");
require("./Expression.js");
require("./MutationObserver.js");

var extend = require("metaphorjs-shared/src/func/extend.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    toBool = require("metaphorjs-shared/src/func/toBool.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @class MetaphorJs.lib.Config
 */
module.exports = MetaphorJs.lib.Config = (function(){

    var $$observable = new MetaphorJs.lib.Observable;

    var MODE_STATIC = 1,
        MODE_DYNAMIC = 2,
        MODE_SINGLE = 3,
        MODE_GETTER = 4,
        MODE_SETTER = 5,
        MODE_FUNC = 6,
        MODE_FNSET = 7,
        MODE_LISTENER = 8;

    /**
     * @constructor
     * @method
     * @param {object} properties Attribute expressions/properties map
     * @param {object} cfg {
     *  @type {object} scope Data object
     *  @type {object} setTo set all values to this object
     * }
     */
    var Config = function(properties, cfg) {

        var self = this,
            k;

        self.id = nextUid();
        self.values = {};
        self.properties = {};
        self.cfg = cfg || {};
        self.keys = [];

        if (properties) {
            for (k in properties) {
                self.setProperty(
                    k, 
                    typeof properties[k] === "string" ? 
                        {expression: properties[k]}:
                        properties[k]
                );
            }
        }
    };

    extend(Config.prototype, {

        id: null,
        properties: null,
        values: null,
        keys: null,
        cfg: null,

        _initMo: function(name) {
            var self = this,
                prop = self.properties[name];
            prop.mo = MetaphorJs.lib.MutationObserver.get(
                self.cfg.scope, prop.expression
            );
            prop.mo.subscribe(self._onPropMutated, self, {
                append: [name]
            });
        }, 

        _unsetMo: function(name) {
            var self = this, prop = self.properties[name];
            if (prop.mo) {
                prop.mo.unsubscribe(self._onPropMutated, self);
                prop.mo.$destroy(true);
                prop.mo = null;
            }
        },

        _calcProperty: function(name) {

            var self = this,
                prop = self.getProperty(name),
                value,
                setTo;

            if (!prop || prop.disabled) {
                return null;
            }

            if (prop.expression) {

                if (!prop.mode) {
                    prop.mode = self.cfg.defaultMode || MODE_DYNAMIC;
                }

                if (prop.mode === MODE_STATIC) {
                    value = prop.expression;
                }
                else if (prop.mode === MODE_SINGLE) {
                    value = MetaphorJs.lib.Expression.get(
                        prop.expression, 
                        self.cfg.scope
                    );
                }
                else if (prop.mode === MODE_DYNAMIC) {
                    !prop.mo && self._initMo(name);
                    value = prop.mo.getValue();
                }
                else if (prop.mode === MODE_GETTER || 
                         prop.mode === MODE_SETTER) {
                    value = MetaphorJs.lib.Expression.parse(
                        prop.expression,
                        {
                            setter: prop.mode === MODE_SETTER,
                            setterOnly: prop.mode === MODE_SETTER,
                            getterOnly: prop.mode === MODE_GETTER
                        }
                    );
                }
                else if (prop.mode === MODE_FNSET) {
                    value = {
                        getter: MetaphorJs.lib.Expression.getter(prop.expression),
                        setter: MetaphorJs.lib.Expression.setter(prop.expression)
                    };
                }
                else if (prop.mode === MODE_FUNC) {
                    value = MetaphorJs.lib.Expression.func(prop.expression);
                }
                else if (prop.mode === MODE_LISTENER) {
                    if (prop.expression.indexOf('(') === -1 && 
                        prop.expression.indexOf('=') === -1) {
                        value = MetaphorJs.lib.Expression.get(
                            prop.expression, 
                            self.cfg.scope
                        );
                    }
                    else {
                        value = MetaphorJs.lib.Expression.func(prop.expression);
                    }
                }
            }

            if (value === undf) {
                value = prop.defaultValue;
            }

            value = self._prepareValue(value, prop);
            self.values[name] = value;

            setTo = self.cfg.setTo || prop.setTo;
            if (setTo) {
                setTo[name] = value;
            }

            return value;
        },


        _prepareValue: function(value, prop) {

            if (!prop.type) {
                return value;
            }

            switch (prop.type) {
                case 'int':
                    return parseInt(value);
                case 'float':
                case 'number':
                    return parseFloat(value);
                case 'bool':
                case 'boolean':
                    return toBool(value);
                case 'array':
                case 'list':
                    return !isArray(value) ? [value] : value;
                case 'string':
                case 'str':
                    return "" + value;
            }

            return value;
        },

        _onPropMutated: function(val, prev, name) {

            var self = this,
                prop = self.properties[name],
                setTo = prop.setTo || self.cfg.setTo,
                value;

            value = self._prepareValue(val, prop);

            self.values[name] = value;
            if (setTo) {
                setTo[name] = value;
            }

            $$observable.trigger(this.id, name, value, prev);
            $$observable.trigger(this.id +'-'+ name, value, prev);
        },

        /**
         * Set Config's option
         * @method
         * @param {string} name 
         * @param {*} value 
         */
        setOption: function(name, value) {
            this.cfg[name] = value;
        },

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {object} cfg {
         *  @type {string} type int|float|array|bool|string
         *  @type {object} setTo
         *  @type {boolean} disabled
         *  @type {*} defaultValue
         *  @type {int} defaultMode
         *  @type {int} mode 1: static, 2: dynamic, 3: single run
         * }
         */

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {string} cfg 
         * @param {*} val 
         */
        setProperty: function(name, cfg, val) {

            var self = this,
                props = self.properties,
                prop,
                changed = false;

            if (!props[name]) {
                props[name] = {};
                self.keys.push(name);
                changed = true;
            }

            prop = props[name];

            if (val === undf) {
                var k;
                for (k in cfg) {
                    if (cfg[k] !== prop[k]) {
                        changed = true;
                        prop[k] = cfg[k];
                    }
                }
            }
            else {
                if (val !== prop[cfg]) {
                    changed = true;
                    prop[cfg] = val;
                }
            }

            if (!prop.mode) {
                if (prop.defaultMode) {
                    prop.mode = prop.defaultMode;
                    changed = true;
                }
                else if (prop.expression === true) {
                    prop.mode = MODE_STATIC;
                    changed = true;
                }
                else if (self.cfg.defaultMode) {
                    prop.mode = self.cfg.defaultMode;
                    changed = true;
                }
            }

            if (prop.mode === MODE_DYNAMIC && 
                prop.expression && 
                !prop.mo && 
                !prop.disabled) {
                self._initMo(name);
                changed = true;
            }

            if (changed && self.values[name] !== undf) {
                delete self.values[name];
            }
        
            return changed;
        },

        /**
         * Get property config
         * @method
         * @param {string} name 
         * @returns {object}
         */
        getProperty: function(name) {
            return this.properties[name] || null;
        },

        /**
         * Get property mode (or null, if not defined)
         * @method
         * @param {string} name 
         * @returns {int|null}
         */
        getMode: function(name) {
            var prop = this.getProperty(name);
            return prop ? prop.mode || null : null;
        },

        /**
         * Get property expression
         * @method
         * @param {string} name 
         */
        getExpression: function(name) {
            var prop = this.getProperty(name);
            return prop ? (prop.expression || null) : null;
        },

        /**
         * Get all config values
         * @method
         * @returns {object}
         */
        getAll: function() {
            var self = this, k, vs = {};
            for (k in self.properties) {
                if (self.values[k] === undf) {
                    vs[k] = self._calcProperty(k);
                }
                else vs[k] = self.values[k];
            }
            return vs;
        },

        /**
         * Iterate over properties
         * @method
         * @param {function} fn {
         *  @param {string} key
         *  @param {object} property
         *  @param {MetaphorJs.lib.Config} self
         * } 
         * @param {object} context 
         */
        eachProperty: function(fn, context) {
            var k, self = this;
            for (k in self.properties) {
                fn.call(context, k, self.properties[k], self);
            }
        },

        /**
         * Does this config has a property
         * @method
         * @param {string} name 
         * @returns {bool}
         */
        hasProperty: function(name) {
            return !!this.properties[name];
        },

        /**
         * Does this config has a property with expression
         * @method
         * @param {string} name 
         * @returns {bool}
         */
        hasExpression: function(name) {
            return !!(this.properties[name] && this.properties[name].expression);
        },

        /**
         * Does this config has an expression to calc value or 
         * already calculated value or default value
         * @method
         * @param {string} name 
         * @returns {boolean}
         */
        has: function(name) {
            var self = this;
            return self.values[name] !== undf || (
                self.properties[name] && 
                (self.properties[name].defaultValue !== undf ||
                 self.properties[name].expression !== undf)
            );
        },

        _toggleProperty: function(name, val) {
            var self = this,
                prop = self.properties[name],
                prev = prop ? prop.disabled || false : false;

            if (!prop) {
                prop = self.setProperty(name, {
                    disabled: val
                });
            }
            else if (prev !== val) {
                prop.mode === MODE_DYNAMIC && self[val ? "_initMo" : "_unsetMo"](name);
                prop.disabled = val;
            }
        },

        /**
         * Disable MutationObserver on a property
         * @method
         * @param {string} name 
         */
        disableProperty: function(name) {
            this._toggleProperty(name, true);
        },

        /**
         * Enable MutationObserver on a property
         * @method
         * @param {string} name 
         */
        enableProperty: function(name) {
            this._toggleProperty(name, false);
        },

        /**
         * Remove config property and its value
         * @param {string} name 
         */
        removeProperty: function(name) {
            if (this.properties[name]) {
                this._toggleProperty(name, true);
                delete this.properties[name];
                delete this.values[name];
            }
        },

        /**
         * Set property mode
         * @method
         * @param {string} name 
         * @param {int} mode 
         */
        setMode: function(name, mode) {
            this.setProperty(name, "mode", mode);
        },

        /**
         * Set property type
         * @method
         * @param {string} name 
         * @param {string} type 
         * @param {int} defaultMode {
         *  @optional
         * }
         * @param {*} defaultValue {
         *  @optional
         * }
         */
        setType: function(name, type, defaultMode, defaultValue) {
            if (type) {
                this.setProperty(name, "type", type);
            }
            if (defaultMode) {
                this.setProperty(name, "defaultMode", defaultMode);
            }
            if (defaultValue !== undf) {
                this.setProperty(name, "defaultValue", defaultValue);
            }
        },

        /**
         * Set default mode
         * @method
         * @param {string} name 
         * @param {int} mode 
         */
        setDefaultMode: function(name, mode) {
            this.setProperty(name, "defaultMode", mode);
        },

        /**
         * Set default value
         * @method
         * @param {string} name 
         * @param {*} val 
         */
        setDefaultValue: function(name, val) {
            this.setProperty(name, "defaultValue", val);
        },

        /**
         * Get property keys
         * @method
         * @returns {array}
         */
        getKeys: function() {
            return this.keys;
        },

        /**
         * Get all keys starting with "value"
         * @method
         */
        getAllValues: function() {
            var self = this,
                i, l, k, name,
                vs = {};

            for (i = 0, l = self.keys.length; i < l; i++) {
                k = self.keys[i];
                if (k === "value") {
                    name = "";
                }
                else if (k.indexOf("value.") === 0) {
                    name = k.replace("value.", "");
                }
                else continue;
                vs[name] = self.get(k);
            }

            return vs;
        },

        /**
         * Get property value
         * @method
         * @param {string} name 
         * @returns {*}
         */
        get: function(name) {
            if (this.values[name] === undf) {
                this._calcProperty(name);
            }
            return this.values[name];
        },

        /**
         * @method on
         * @param {string} name 
         * @param {function} fn {
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt MetaphorJs.lib.Observable.on() options
         */

         /**
         * @method on
         * @param {function} fn {
         *  @param {string} name
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt MetaphorJs.lib.Observable.on() options
         */
        on: function(name, fn, context, opt) {
            if (typeof name === "string") {
                $$observable.on(this.id +'-'+ name, fn, context, opt);
            }
            else {
                $$observable.on(this.id, name, fn, context);
            }
        },

        /**
         * @method un
         * @param {string} name 
         * @param {function} fn
         * @param {object} context 
         */

         /**
         * @method un
         * @param {function} fn 
         * @param {object} context 
         */
        un: function(name, fn, context) {
            if (typeof name === "string") {
                $$observable.on(this.id +'-'+ name, fn, context);
            }
            else {
                $$observable.on(this.id, name, fn);
            }
        },

        /**
         * Set property values to this object
         * @method
         * @param {object} obj 
         */
        setTo: function(obj) {
            this.cfg.setTo = obj;
        },

        /**
         * Check for changes of specific property
         * @method
         * @param {string} name 
         * @returns {bool}
         */

        /**
         * Check for changes
         * @method
         * @returns {int} number of changed properties
         */
        check: function(name) {
            var self = this,
                keys = name ? [name] : self.keys,
                i, l, key, prop,
                res = name ? 0 : false;
            
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                prop = self.properties[key];
                if (prop.mo) {
                    if (name) {
                        return prop.mo.check();
                    }
                    res += prop.mo.check() ? 1 : 0;
                }
            }

            return res;
        },

        /**
         * Check scope based on property opts 
         * (does it require checking parent or root)
         * @method
         * @param {string} propName 
         */
        checkScope: function(propName) {
            var scope = this.cfg.scope,
                descr = MetaphorJs.lib.Expression.describeExpression(
                    this.getExpression(propName)
                );

            if (descr.indexOf("r") !== -1) {
                return scope.$root.$check();
            }
            else if (descr.indexOf("p") !== -1) {
                return scope.$parent ? 
                        scope.$parent.$check() : 
                        scope.$root.$check();
            }
            else {
                return scope.$check();
            }
        },

        /**
         * Stop all observers, clear data, remove listeners.
         * But keep values and properties
         * @method
         */
        clear: function() {
            var self = this,
            id = self.id,
            k;

            if (self.properties === null) {
                return;
            }

            for (k in self.properties) {
                self._unsetMo(k);
                $$observable.destroyEvent(id +'-'+ k);
            }

            $$observable.destroyEvent(id);

            self.subscribe = emptyFn;
            self.unsubscribe = emptyFn;
        },

        /**
         * @method
         */
        $destroy: function() {
            var self = this;

            if (self.properties !== null) {
                self.clear();
            }

            self.properties = null;
            self.values = null;
            self.cfg = null;
        }
    });

    Config.MODE_STATIC = MODE_STATIC;
    Config.MODE_DYNAMIC = MODE_DYNAMIC;
    Config.MODE_SINGLE = MODE_SINGLE;
    Config.MODE_GETTER = MODE_GETTER;
    Config.MODE_SETTER = MODE_SETTER;
    Config.MODE_FUNC = MODE_FUNC;
    Config.MODE_FNSET = MODE_FNSET;
    Config.MODE_LISTENER = MODE_LISTENER;

    return Config;

}());