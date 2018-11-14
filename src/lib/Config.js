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

    $$observable = new MetaphorJs.lib.Observable;

    var MODE_STATIC = 1,
        MODE_DYNAMIC = 2,
        MODE_SINGLE = 3,
        MODE_GETTER = 4,
        MODE_SETTER = 5,
        MODE_FNSET = 6;

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
        self.propeties = {};
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
                self.keys.push(k);
            }
            if (!self.cfg.deferInit) {
                self._initialCalc();
            }
        }
    };

    extend(Config.prototype, {

        id: null,
        propeties: null,
        values: null,
        keys: null,
        cfg: null,

        /**
         * If you used deferInit=true, use this method to finish
         * initialization
         * @method
         */
        lateInit: function() {
            this._initialCalc();
        },

        _initialCalc: function() {
            var self = this,
                k, prop,
                scope = self.cfg.scope,
                name;

            for (name in self.properties) {

                prop = self.properties[k];

                if (prop.disabled) {
                    continue;
                }

                if (prop.mode === MODE_DYNAMIC) {
                    prop.mo = MetaphorJs.lib.MutationObserver.get(
                        scope, prop.expression
                    );
                    prop.mo.subscribe(self._onPropMutated, self, {
                        append: [name]
                    });
                }
                else if (prop.mode === MODE_GETTER || 
                            prop.mode === MODE_SETTER) {
                    self.values[name] = MetaphorJs.lib.Expression.parse(
                        prop.exression,
                        {
                            setter: prop.mode === MODE_SETTER,
                            setterOnly: prop.mode === MODE_SETTER
                        }
                    );
                }
                else if (prop.mode === MODE_FNSET) {
                    self.values[name] = {
                        getter: MetaphorJs.lib.Expression.parse(prop.exression),
                        setter: MetaphorJs.lib.Expression.setter(
                            prop.exression,
                            {setter: true, setterOnly: true}
                        )
                    };
                }
            }

            self._initialCalc = emptyFn;
        },


        _calcProperty: function(name) {

            var self = this,
                prop = self.getProperty(k),
                value,
                setTo;

            if (prop.disabled) {
                return null;
            }

            if (prop.mode === MODE_STATIC) {
                value = values[name];
            }
            else if (prop.mode === MODE_SINGLE) {
                value = MetaphorJs.lib.Expression.run(
                    prop.expression, 
                    self.scope
                );
            }
            else {
                value = prop.mo.getValue();
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
                prop = self.propeties[name],
                setTo = prop.setTo || self.cfg.setTo;

            value = self._prepareValue(val, prop);
            self.values[name] = val;
            if (setTo) {
                setTo[name] = val;
            }

            $$observable.trigger(this.id, name, val, prev);
            $$observable.trigger(this.id +'-'+ name, val, prev);
        },

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {object} cfg {
         *  @type {string} type int|float|array|bool|string
         *  @type {object} setTo
         *  @type {boolean} disabled
         *  @type {int} mode 1: static, 2: dynamic, 3: single run
         * }
         */
        setProperty: function(name, cfg) {

            if (this.propeties[name]) {
                return extend(this.propeties[name], cfg, false, false);
            }

            //cfg.setAs = cfg.setAs || name;
            return this.propeties[name] = cfg;
        },

        /**
         * Get property config
         * @param {string} name 
         * @returns {object}
         */
        getProperty: function(name) {
            return this.properties[name] || null;
        },

        /**
         * Get all config values
         * @method
         * @returns {object}
         */
        getValues: function() {
            var self, k, vs = {};
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
         * @param {function} fn {
         *  @param {string} key
         *  @param {object} property
         *  @param {MetaphorJs.lib.Config} self
         * } 
         * @param {object} context 
         */
        eachProperty: function(fn, context) {
            var k;
            for (k in self.properties) {
                fn.call(context, k, self.properties[k], self);
            }
        },

        /**
         * Does this config has a property
         * @param {string} name 
         * @returns {bool}
         */
        hasProperty: function(name) {
            return !!this.properties[name];
        },

        /**
         * Get property keys
         * @returns {array}
         */
        getKeys: function() {
            return this.keys;
        },

        /**
         * Get property value
         * @method
         * @param {string} name 
         * @returns {*}
         */
        getValue: function(name) {
            return this.get(name);
        },

        /**
         * Get all keys starting with "value"
         */
        getAllValues: function() {
            var self = this,
                i, l, k, name,
                vs = {};

            for (i = 0, l = self.keys.length; i < l; i++) {
                k = keys[i];
                if (k === "value") {
                    name = "";
                }
                else if (k.indexOf("value.") === 0) {
                    name = k.replace("value.", "");
                }
                else continue;
                vs[name] = self.getValue(k);
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
         * Stop all observers, clear data, remove listeners.
         * But keep values and properties
         * @method
         */
        clear: function() {
            var self = this,
            id = self.id,
            k, prop;

            if (self.propeties === null) {
                return;
            }

            for (k in self.propeties) {
                prop = self.propeties[k];
                if (prop.mo) {
                    prop.mo.unsubscribe(self._onPropMutated, self);
                    prop.mo.$destroy(true);
                    prop.mo = null;
                }
                $$observable.destroyEvent(id +'-'+ prop.name);
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

            if (self.propeties !== null) {
                self.clear();
            }

            self.propeties = null;
            self.values = null;
            self.cfg = null;
        }
    });

    Config.MODE_STATIC = MODE_STATIC;
    Config.MODE_DYNAMIC = MODE_DYNAMIC;
    Config.MODE_SINGLE = MODE_SINGLE;
    Config.MODE_GETTER = MODE_GETTER;
    Config.MODE_SETTER = MODE_SETTER;

    return Config;

}());