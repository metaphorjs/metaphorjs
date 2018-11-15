require("metaphorjs-observable/src/lib/Observable.js");
require("./Expression.js");
require("./MutationObserver.js");

var extend = require("metaphorjs-shared/src/func/extend.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * The scope object is what templates see while rendering
 * @class MetaphorJs.lib.Scope
 */
/**
 * @method Scope
 * @constructor
 * @param {object} cfg Whatever data should be visible in template
 */
MetaphorJs.lib.Scope = function(cfg) {
    var self    = this;

    self.$$observable    = new MetaphorJs.lib.Observable;
    self.$$historyWatchers  = {};
    extend(self, cfg, true, false);

    if (self.$parent) {
        /**
         * @event check
         * @param {array} changes 
         */
        self.$parent.$on("check", self.$$onParentCheck, self);
        /**
         * @event changed
         */
        /**
         * @event destroy
         */
        self.$parent.$on("destroy", self.$$onParentDestroy, self);
        /**
         * @event freeze
         * @param {MetaphorJs.lib.Scope}
         */
        self.$parent.$on("freeze", self.$freeze, self);
        /**
         * @event unfreeze
         * @param {MetaphorJs.lib.Scope}
         */
        self.$parent.$on("unfreeze", self.$unfreeze, self);
    }
    else {
        self.$root  = self;
        self.$isRoot= true;
    }
};

extend(MetaphorJs.lib.Scope.prototype, {

    /**
     * @property {MetaphorJs.app.App}
     */
    $app: null,

    /**
     * @property {MetaphorJs.lib.Scope}
     */
    $parent: null,

    /**
     * @property {MetaphorJs.lib.Scope}
     */
    $root: null,

    /**
     * @property {boolean}
     */
    $isRoot: false,

    /**
     * @property {int}
     */
    $level: 0,

    $static: false,
    $$frozen: false,
    $$observable: null,
    $$watchers: null,
    $$historyWatchers: null,
    $$checking: false,
    $$destroyed: false,
    $$changing: false,

    $$tmt: null,

    /**
     * Create child scope
     * @method
     * @param {object} data Child scope data
     * @returns {MetaphorJs.lib.Scope}
     */
    $new: function(data) {
        var self = this;
        return new MetaphorJs.lib.Scope(extend({}, data, {
            $parent: self,
            $root: self.$root,
            $app: self.$app,
            $level: self.$level + 1,
            $static: self.$static
        }, true, false));
    },

    /**
     * Create child scope with no relation to this scope (no $parent)
     * but with $app propery set.
     * @method
     * @param {object} data Child scope data
     * @returns {MetaphorJs.lib.Scope}
     */
    $newIsolated: function(data) {
        return new MetaphorJs.lib.Scope(extend({}, data, {
            $app: this.$app,
            $level: self.$level + 1,
            $static: this.$static
        }, true, false));
    },

    /**
     * Freeze the scope. It will not perfom checks and trigger change events
     * @method
     */
    $freeze: function() {
        var self = this;
        if (!self.$$frozen) {
            self.$$frozen = true;
            self.$$observable.trigger("freeze", self);
        }
    },

    /**
     * Unfreeze scope. Resume checking for changes
     * @method
     */
    $unfreeze: function() {
        var self = this;
        if (self.$$frozen) {
            self.$$frozen = false;
            self.$$observable.trigger("unfreeze", self);
        }
    },

    /**
     * Subsrcibe to scope events
     * @method 
     * @param {string} event
     * @param {function} fn
     * @param {object} fnScope 
     */
    $on: function(event, fn, fnScope) {
        return this.$$observable.on(event, fn, fnScope);
    },

    /**
     * Unsubsrcibe from scope events
     * @method 
     * @param {string} event
     * @param {function} fn
     * @param {object} fnScope 
     */
    $un: function(event, fn, fnScope) {
        return this.$$observable.un(event, fn, fnScope);
    },

    /**
     * Create a function out of an expression and bind it to the scope
     * @method
     * @param {string} expr 
     * @param {object} opt See MetaphorJs.lib.Expression.parse
     * @returns {function}
     */
    $parseExpression: function(expr, opt) {
        var self = this,
            func = MetaphorJs.lib.Expression.parse(expr, opt);
        return function(inputVal) {
            return func(self, inputVal);
        }
    },

    /**
     * Create a watcher on js expression
     * @method
     * @param {string} expr js expression
     * @param {function} fn {
     *  @param {*} value
     * }
     * @param {object} fnScope
     * @returns {MetaphorJs.lib.MutationObserver}
     */
    $watch: function(expr, fn, fnScope) {
        return MetaphorJs.lib.MutationObserver.get(this, expr, fn, fnScope);
    },

    /**
     * Stop watching js expression
     * @method
     * @param {string} expr js expression
     * @param {function} fn 
     * @param {object} fnScope
     */
    $unwatch: function(expr, fn, fnScope) {
        var mo = MetaphorJs.lib.MutationObserver.exists(this, expr);
        if (mo) {
            mo.unsubscribe(fn, fnScope);
            mo.$destroy(true);
        }
    },

    /**
     * Watch changes in page url. Triggers regular change event
     * @method
     * @param {string} prop Scope property name
     * @param {string} param Url param name
     */
    $watchHistory: function(prop, param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            self.$$historyWatchers[param] = prop;
            MetaphorJs.lib.History.on("change-" + param, self.$$onHistoryChange, self);
        }
    },

    /**
     * Stop watching changes in page url.
     * @method
     * @param {string} param Url param name
     */
    $unwatchHistory: function(param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            delete self.$$historyWatchers[param];
            MetaphorJs.lib.History.un("change-" + param, self.$$onHistoryChange, self);
        }
    },


    /**
     * Set scope value and check for changes.
     * @method
     * @param {string} key
     * @param {*} value
     */
     /**
     * Set scope value and check for changes.
     * @method
     * @param {object} obj Key:value pairs
     */
    $set: function(key, value) {
        var self = this;
        if (typeof key === "string") {
            this[key] = value;
        }
        else {
            for (var k in key) {
                self[k] = key[k];
            }
        }
        this.$check();
    },

    $$onParentDestroy: function() {
        this.$destroy();
    },

    $$onParentCheck: function() {
        this.$check();
    },

    $$onHistoryChange: function(val, prev, name) {
        var self = this,
            prop;
        if (self.$$historyWatchers[name]) {
            prop = self.$$historyWatchers[name];
            self[prop] = val;
            self.$check();
        }
    },

    /**
     * Schedule a delayed check
     * @method
     * @param {int} timeout
     */
    $scheduleCheck: function(timeout) {
        var self = this;
        if (!self.$$tmt) {
            self.$tmt = async(self.$check, self, null, timeout);
        }
    },

    /**
     * Check for changes and trigger change events.<br>
     * If changes are found, the check will run again
     * until no changes is found.
     * @method
     */
    $check: function() {
        var self = this,
            changes;

        if (self.$$checking || self.$static || self.$$frozen) {
            return;
        }
        self.$$checking = true;

        if (self.$$tmt) {
            clearTimeout(self.$$tmt);
            self.$$tmt = null;
        }

        if (self.$$mo) {
            changes = self.$$mo.$checkAll();
        }

        self.$$checking = false;

        if (!self.$$destroyed) {
            self.$$observable.trigger("check", changes);
        }

        if (changes > 0) {
            self.$$changing = true;
            self.$check();
        }
        else {
            // finished changing after all iterations
            if (self.$$changing) {
                self.$$changing = false;
                self.$$observable.trigger("changed");
            }
        }
    },

    /**
     * Destroy scope
     * @method
     */
    $destroy: function() {

        var self    = this,
            param, i;

        if (self.$$destroyed) {
            return;
        }

        self.$$destroyed = true;
        self.$$observable.trigger("destroy");
        self.$$observable.$destroy();

        if (self.$parent && self.$parent.$un) {
            self.$parent.$un("check", self.$$onParentCheck, self);
            self.$parent.$un("destroy", self.$$onParentDestroy, self);
            self.$parent.$un("freeze", self.$freeze, self);
            self.$parent.$un("unfreeze", self.$unfreeze, self);
        }

        if (self.$$mo) {
            MetaphorJs.lib.MutationObserver.$destroy(self);
        }

        for (param in self.$$historyWatchers) {
            self.$unwatchHistory(param);
        }

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }

        self.$$destroyed = true;
    }

}, true, false);


module.exports = MetaphorJs.lib.Scope;