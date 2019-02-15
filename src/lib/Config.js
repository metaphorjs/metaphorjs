require("metaphorjs-observable/src/lib/Observable.js");
require("./Expression.js");
require("./MutationObserver.js");

var extend = require("metaphorjs-shared/src/func/extend.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    toBool = require("metaphorjs-shared/src/func/toBool.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    isPrimitive = require("metaphorjs-shared/src/func/isPrimitive.js"),
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
     * @param {string} scalarAs {
     *  expression|defaultValue|value -- 
     *  if property comes as scalar value {name: value}, this
     *  option helps determine what to do with it, make an expression
     *  out of it, or use as default value.
     * }
     */
    var Config = function(properties, cfg, scalarAs) {

        var self = this;

        self.id = nextUid();
        self.values = {};
        self.properties = {};
        self.cfg = cfg || {};
        self.keys = [];

        if (properties) {
            self.addProperties(properties, scalarAs);
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
                prop.scope || self.cfg.scope, 
                prop.expression
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
                        value = self._wrapListener(
                                    value, 
                                    prop.scope || self.cfg.scope
                                );
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

        _wrapListener: function(ls, scope) {
            return function() {
                var args = toArray(arguments),
                    i, l;
                for (i = 1, l = args.length; i <= l; i++) {
                    scope["$" + i] = args[i];
                }
                ls(scope);
                for (i = 1, l = args.length; i <= l; i++) {
                    delete scope["$" + i];
                }
            };
        },


        _prepareValue: function(value, prop) {

            if (!prop.type) {
                return value;
            }

            if (value === true && 
                prop.type !== "bool" && 
                prop.type !== "boolean" && 
                prop.defaultValue) {
                value = prop.defaultValue;
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
                    return value === null || value === undf ? "" : "" + value;
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
         * Get config's option
         * @param {string} name 
         * @returns {*}
         */
        getOption: function(name) {
            return this.cfg[name];
        },

        /**
         * Add multiple properties to the config.
         * @param {object} properties {name: {cfg}}
         * @param {string} scalarAs {
         *  expression|defaultValue|value -- 
         *  if property comes as scalar value {name: value}, this
         *  option helps determine what to do with it, make an expression
         *  out of it, or use as default value.
         * }
         * @param {bool} override {
         *  Override existing settings
         *  @default true
         * }
         */
        addProperties: function(properties, scalarAs, override) {

            var prop, k, val;
            for (k in properties) {
                val = properties[k];

                if (val === null || val === undf) {
                    continue;
                }

                // string can be a value or expression
                if (typeof val === "string") {
                    prop = {};
                    prop[scalarAs || "expression"] = val;
                }
                // bool and int can only be a value
                else if (isPrimitive(val)) {
                    prop = {defaultValue: val};
                }
                // objects can only describe properties
                else {
                    prop = val;
                    if (prop.expression && 
                        typeof prop.expression === "string" && 
                        !prop.mode && scalarAs === "defaultValue" && 
                        (!this.properties[k] || !this.properties[k].mode)) {
                        
                        prop.mode = MODE_DYNAMIC;
                    }
                }
                this.setProperty(k, prop, undf, override);
            }
        },

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {object} cfg {
         *  @type {string} type int|float|array|bool|string
         *  @type {object} setTo
         *  @type {object} scope
         *  @type {boolean} disabled
         *  @type {*} defaultValue
         *  @type {*} value
         *  @type {int} defaultMode
         *  @type {int} mode MetaphorJs.lib.Config.MODE_***
         * }
         */

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {string} cfg 
         * @param {*} val 
         * @param {bool} override {
         *  @default true
         * }
         */
        setProperty: function(name, cfg, val, override) {

            var self = this,
                props = self.properties,
                prop,
                changed = false,
                newProp = false,
                changes = {},
                value;

            if (override === undf) {
                override = true;
            }

            if (!props[name]) {
                props[name] = {};
                self.keys.push(name);
                changed = true;
                newProp = true;
            }

            if (!cfg) {
                cfg = {};
            }

            prop = props[name];

            if (prop.final === true) {
                return false;
            }

            if (val === undf || val === null) {
                var k;
                for (k in cfg) {
                    if (k === "value") {
                        value = cfg[k];
                        continue;
                    }
                    else if (prop[k] === undf || 
                            (cfg[k] !== prop[k] && override)) {
                        changes[k] = true;
                        prop[k] = cfg[k];
                    }
                }
            }
            else {
                if (cfg === "value") {
                    value = val;
                }
                else if (prop[cfg] === undf || 
                        (prop[cfg] !== val && override)) {
                    changes[cfg] = true;
                    prop[cfg] = val;
                }
            }

            if (!prop.mode) {
                if (prop.defaultMode) {
                    prop.mode = prop.defaultMode;
                    changed = true;
                }
                else if (prop.expression === true || 
                        prop.expression === false) {
                    prop.mode = MODE_STATIC;
                    changed = true;
                }
                else if (self.cfg.defaultMode) {
                    prop.mode = self.cfg.defaultMode;
                    changed = true;
                }
                else if (newProp && value !== undf && value !== null) {
                    prop.mode = MODE_STATIC;
                }
            }

            if (!prop.scope) {
                prop.scope = self.cfg.scope;
            }

            if (prop.mode === MODE_DYNAMIC && 
                prop.expression && 
                !prop.mo && 
                !prop.disabled) {
                self._initMo(name);
            }

            if (value !== undf && value !== null) {
                self.values[name] = value;
            }
            else if (self.values[name] !== undf) {
                if (changes.mode || changes.expression || (
                    !prop.mode && changes.defaultMode
                )) {
                    delete self.values[name];
                }
            }
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
         * Create prop definition copy (without mutation observer)
         * @param {string} name 
         */
        copyProperty: function(name) {
            var prop = this.properties[name],
                cp;

            if (prop) {
                cp = extend({}, prop, false, false);
                cp.scope = cp.scope || this.cfg.scope;
                delete cp['mo'];

                if (cp.mode === MODE_STATIC || 
                    (!cp.mode && cp.defaultMode === cp.mode === MODE_STATIC) ||
                    (!cp.mode && !cp.defaultMode)) {
                    if (this.values[name] !== undf) {
                        cp.value = this.values[name];
                    }
                }
                return cp;
            }
            else return null;
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
                if (self.values[k] === undf || isNaN(self.values[k])) {
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
         * Does this config has a value for given key
         * @param {string} name 
         * @returns {bool}
         */
        hasValue: function(name) {
            return this.values[name] !== undf;
        },

        /**
         * Does this config has an expression to calc value or 
         * already calculated value or default value
         * @method
         * @param {string} name 
         * @returns {boolean}
         */
        has: function(name) {
            var self = this,
                v = self.values[name];
            return (v !== undf && v !== null && !isNaN(v)) || (
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
                prop.mode === MODE_DYNAMIC && self[!val ? "_initMo" : "_unsetMo"](name);
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
                var inx = this.keys.indexOf(name);
                if (inx !== -1) {
                    this.keys.splice(inx, 1);
                }
            }
        },

        /**
         * Set property mode
         * @method
         * @param {string} name 
         * @param {int} mode 
         * @param {string|*} expression
         */
        setMode: function(name, mode, expression) {
            var prop = {mode: mode};
            if (expression !== undf) {
                prop.expression = expression;
            }
            this.setProperty(name, prop);
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
         * @param {bool} override {
         * @default true
         * }
         */
        setType: function(name, type, defaultMode, defaultValue, override) {
            if (type) {
                this.setProperty(name, "type", type, override);
            }
            if (defaultMode) {
                this.setProperty(name, "defaultMode", defaultMode, override);
            }
            if (defaultValue !== undf) {
                this.setProperty(name, "defaultValue", defaultValue, override);
            }
        },

        /**
         * Set default mode
         * @method
         * @param {string} name 
         * @param {int} mode 
         * @param {bool} override {
         * @default true
         * }
         */
        setDefaultMode: function(name, mode, override) {
            this.setProperty(name, "defaultMode", mode, override);
        },

        /**
         * Set default value
         * @method
         * @param {string} name 
         * @param {*} val 
         * @param {bool} override {
         * @default true
         * }
         */
        setDefaultValue: function(name, val, override) {
            this.setProperty(name, "defaultValue", val, override);
        },

        /**
         * Transform property to dynamic mode if it is static
         * @param {string} name 
         * @param {string} expression 
         * @param {object|null} scope {
         *  @optional
         * }
         */
        makeLocalDynamic: function(name, expression, scope) {
            var self = this,
                prop, val;
            scope = scope || self.cfg.scope;
            if (prop = self.properties[name]) {
                if (prop.final) {
                    return;
                }
                if (!prop.mode || prop.mode === MODE_STATIC || prop.mode === MODE_SINGLE) {
                    val = self.get(name);
                    self.setProperty(name, {
                        expression: expression,
                        mode: MODE_DYNAMIC,
                        scope: scope
                    });
                    self.values[name] = val;
                    self.set(name, val);
                }
            }
            else {
                self.setProperty(name, {
                    expression: expression,
                    mode: MODE_DYNAMIC,
                    scope: scope
                });
            }
        },

        /**
         * Force property to static mode with given value
         * @param {string} name 
         * @param {*} val 
         */
        setStatic: function(name, val) {
            var self = this;
            if (self.properties[name] && self.properties[name].final) {
                return;
            }
            var prev = self.values[val];
            self.setMode(name, MODE_STATIC);
            self.values[name] = val;
            if (prev != val) {
                $$observable.trigger(self.id, name, val, prev);
                $$observable.trigger(self.id +'-'+ name, val, prev) ;
            }
        },

        /**
         * Lock the property
         * @param {string} name 
         */
        setFinal: function(name) {
            this.setProperty(name, "final", true);
        },

        /**
         * Try to set value based on property mode
         * @param {string} name 
         * @param {*} val 
         */
        set: function(name, val) {
            var self = this,
                prop;
            if (!self.properties[name]) {
                self.setProperty(name);
            }
            prop = self.properties[name];
            switch (prop.mode) {
                case MODE_DYNAMIC: {
                    !prop.mo && self._initMo(name);
                    prop.mo.setValue(val);
                    break;
                }
                case MODE_GETTER:
                case MODE_FUNC:
                case MODE_SETTER:
                case MODE_FNSET: {
                    throw new Error("Incompatible property mode");
                }
                case MODE_SINGLE:
                case MODE_STATIC: {
                    self.setStatic(name, val);
                    break;
                }
                default: {
                    self.setStatic(name, val);
                    break;
                }
            }
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
            if (this.values[name] === undf || isNaN(this.values[name])) {
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
         * Import properties and values from another config
         * @method
         * @param {MetaphorJs.lib.Config} config 
         */
        importConfig: function(config, overwrite) {
            var name,
                ps = this.properties,
                vs = this.values;

            for (name in config.properties) {
                if (config.properties.hasOwnProperty(name)) {

                    if (ps[name] && !overwrite) {
                        continue;
                    }
                    ps[name] = extend({}, config.properties[name]);
                    vs[name] = config.values[name];
                }
            }
        },

        /**
         * Create a new config with given properties
         * @method
         * @param {array} props
         * @param {object} cfg override new config cfg with these values
         * @returns MetaphorJs.lib.Config
         */
        slice: function(props, overrideCfg) {
            var map = {}, self = this, 
                name, i, l,
                values = {},
                existing = self.properties;
            for (i = 0, l = props.length; i < l; i++) {
                name = props[i];
                if (existing[name]) {
                    map[name] = extend({}, existing[name], false, false);
                    values[name] = self.values[name];
                    delete map[name].mo;
                }
            }
            var newCfg = new Config(
                map,
                extend({}, self.cfg, overrideCfg, true, false)
            );
            newCfg.values = values;
            return newCfg;
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

            if (!this.cfg) {
                return;
            }

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


    Config.create = function(properties, cfg, scalarAs) {
        if (properties instanceof Config) {
            return properties;
        }
        return new Config(properties, cfg, scalarAs);
    }

    return Config;

}());