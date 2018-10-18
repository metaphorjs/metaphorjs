require("metaphorjs-observable/src/lib/Observable.js");
require("./Expression.js");
require("./MutationObserver.js");

var extend = require("metaphorjs-shared/src/func/extend.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    toBool = require("metaphorjs-shared/src/func/toBool.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @class MetaphorJs.lib.Config
 */
module.exports = MetaphorJs.lib.Config = (function(){

    $$observable = new MetaphorJs.lib.Observable;

    var MODE_STATIC = 1,
        MODE_DYNAMIC = 2,
        MODE_SINGLE = 3;

    var detectMode = function(name) {
        mode = MODE_DYNAMIC;

        if (name[0] === '$') {
            mode = MODE_STATIC;
            name = name.substr(1);
        }

        if (name[0] === '$') {
            mode = MODE_SINGLE;
            name = name.substr(1);
        }

        return [mode, name];
    };

    /**
     * @constructor
     * @method
     * @param {object} values Attribute values map
     * @param {object} cfg {
     *  @type {object} scope Data object
     *  @type {object} properties Each property config
     * }
     */
    var Config = function(values, cfg) {

        var self = this;

        self.id = nextUid();
        self.values = {};
        self.propeties = {};
        self.cfg = cfg;

        var k;

        if (cfg.properties) {
            for (k in cfg.properties) {
                self.setProperty(k, cfg.properties[k]);
            }
        }


        if (values) {
            self._initialCalc(values);
        }
    };

    extend(Config.prototype, {

        id: null,
        propeties: null,
        values: null,
        cfg: null,

        _initialCalc: function(values) {
            var self = this,
                k, value, prop, setTo,
                scope = self.cfg.scope,
                item, name;

            self.values = {};

            for (k in values) {

                item = detectMode(k);
                name = item[1];
                prop = self.setProperty(name, {
                    mode: item[0]
                });
        
                if (prop.mode === MODE_STATIC) {
                    value = values[k];
                }
                else if (prop.mode === MODE_SINGLE) {
                    value = MetaphorJs.lib.Expression.run(values[k], scope);
                }
                else {
                    prop.mo = MetaphorJs.lib.MutationObserver.get(scope, values[k]);
                    prop.mo.subscribe(self._onPropMutated, self, {
                        append: [name]
                    });
                    value = prop.mo.getValue();
                }

                value = self._prepareValue(value, prop);
                self.values[name] = value;

                setTo = self.cfg.setTo || prop.setTo;
                if (setTo) {
                    setTo[name] = value;
                }
            }
        },



        _prepareValue: function(value, prop) {

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
         * }
         */
        setProperty: function(name, cfg) {


            if (this.propeties[name]) {
                return extend(this.propeties[name], cfg, false, false);
            }

            cfg.setAs = cfg.setAs || name;
            return this.propeties[name] = cfg;
        },

        /**
         * Get all config values
         * @method
         * @returns {object}
         */
        getValues: function() {
            return this.values;
        },

        /**
         * Get property value
         * @method
         * @param {string} name 
         * @returns {*}
         */
        getValue: function(name) {
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
         * @method
         */
        $destroy: function() {
            var self = this,
                id = self.id,
                k, prop;

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

            self.propeties = null;
            self.values = null;
            self.cfg = null;
        }
    });

    Config.MODE_STATIC = MODE_STATIC;
    Config.MODE_DYNAMIC = MODE_DYNAMIC;
    Config.MODE_SINGLE = MODE_SINGLE;

    return Config;

}());