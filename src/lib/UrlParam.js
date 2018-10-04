
require("./History.js"),
require("metaphorjs-shared/src/func/browser/parseLocation.js");
require("metaphorjs-observable/src/mixin/Observable.js");

var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    getRegExp = require("metaphorjs-shared/src/func/getRegExp.js");    


module.exports = MetaphorJs.lib.UrlParam = (function(){

    var cache = {};

    /**
     * Url param watcher
     * @class MetaphorJs.lib.UrlParam
     */
    var UrlParam = cls({

        $mixins: [MetaphorJs.mixin.Observable],

        id: null,
        name: null,
        extractor: null,
        context: null,
        regexp: null,
        valueIndex: 1,
        prev: null,
        value: null,
        enabled: true,

        /**
         * @method
         * @constructor
         * @param {object} cfg {
         *  @type {string} id unique param id
         *  @type {string|RegExp} regexp
         *  @type {string} name
         *  @type {function} extractor {
         *      @param {string} url     
         *      @returns {*} value
         *  }
         *  @type {object} context extractor's context
         *  @type {int} valueIndex {
         *      Index in regexp match array
         *      @default 1
         *  }
         * }
         */
        $init: function(cfg) {

            var self = this;

            extend(self, cfg, true, false);

            if (self.regexp && isString(self.regexp)) {
                self.regexp = getRegExp(self.regexp);
            }

            if (self.name && !self.regexp && !self.extractor) {
                self.regexp = getRegExp(self.name + "=([^&]+)");
            }

            if (!self.regexp && !self.extractor) {
                throw new Error("Invalid UrlParam config, missing regexp or extractor");
            }

            if (self.enabled) {
                self.enabled = false;
                self.enable();
            }
        },

        /**
         * Enable watcher (enabled by default)
         * @method 
         */
        enable: function() {
            var self = this;
            if (!self.enabled) {
                self.enabled = true;
                MetaphorJs.lib.History.on("location-change", self.onLocationChange, self);
                var url = currentUrl(),
                    loc = MetaphorJs.browser.parseLocation(url);
                self.onLocationChange(loc.pathname + loc.search + loc.hash);
            }
        },

        /**
         * Disable watcher
         * @method
         */
        disable: function() {
            var self = this;
            if (self.enabled) {
                self.enabled = false;
                MetaphorJs.lib.History.un("location-change", self.onLocationChange, self);
            }
        },

        onLocationChange: function(url) {

            var self = this,
                value = self.extractValue(url);

            if (self.value != value) {
                self.prev = self.value;
                self.value = value;
                self.trigger("change", value, self.prev);
            }
        },

        /**
         * Extract param value from url
         * @method
         * @param {string} url
         * @returns {string}
         */
        extractValue: function(url) {
            var self = this;
            if (self.regexp) {
                var match = url.match(self.regexp);
                return match ? match[self.valueIndex] : null;
            }
            else if (self.extractor) {
                return self.extractor.call(self.context, url);
            }
        },

        /**
         * Get current param value
         * @method
         * @returns {string|null}
         */
        getValue: function() {
            return this.value;
        },

        /**
         * Get previous value
         * @method
         * @returns {string|null}
         */
        getPrev: function() {
            return this.prev;
        },

        /**
         * Destroy param watcher if there are no listeners
         * @method
         */
        destroyIfIdle: function() {
            var self = this;
            if (!self.$$observable.hasListener()) {
                self.$destroy();
            }
        },

        onDestroy: function() {
            var self = this;
            self.disable();
        }

    }, {

        /**
         * Get already initialized instance based on cfg.id
         * @static
         * @method
         * @param {object} cfg See constructor
         * @returns {MetaphorJs.lib.UrlParam}
         */
        get: function(cfg) {
            if (cfg.id && cache[cfg.id]) {
                return cache[cfg.id];
            }
            else {
                return new UrlParam(cfg);
            }
        }

    });

    return UrlParam;
}());