require("metaphorjs-observable/src/lib/Observable.js");
require("./MutationObserver.js");

const extend = require("metaphorjs-shared/src/func/extend.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


/**
 * The state object is what templates see as "this" when executing expressions.
 * (Actually, this is more like a Context)
 * @class MetaphorJs.lib.State
 */
module.exports = MetaphorJs.lib.State = (function(){


const publicStates = {};

/**
 * @method State
 * @constructor
 * @param {object} cfg Whatever data should be visible in template
 */
const State = function(cfg) {

    this.$$observable       = new MetaphorJs.lib.Observable;
    this.$$historyWatchers  = {};
    extend(this, cfg, true, false);

    if (this.$parent) {
        /**
         * @event check
         * @param {array} changes 
         */
        this.$parent.$on("check", this.$$onParentCheck, this);
        /**
         * @event changed
         */
        /**
         * @event destroy
         */
        this.$parent.$on("destroy", this.$$onParentDestroy, this);
        /**
         * @event freeze
         * @param {MetaphorJs.lib.State}
         */
        this.$parent.$on("freeze", this.$freeze, this);
        /**
         * @event unfreeze
         * @param {MetaphorJs.lib.State}
         */
        this.$parent.$on("unfreeze", this.$unfreeze, this);
    }
    else {
        this.$root  = this;
        this.$isRoot= true;
    }

    if (this.$$publicName) {
        if (publicStates[this.$$publicName]) {
            this.$$publicName = null;
        }
        publicStates[this.$$publicName] = this;
    }
};

extend(State.prototype, {

    /**
     * @property {MetaphorJs.app.App}
     */
    $app: null,

    /**
     * @property {MetaphorJs.lib.State}
     */
    $parent: null,

    /**
     * @property {MetaphorJs.lib.State}
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
    $$publicName: null,

    $$tmt: null,

    /**
     * Create child state
     * @method
     * @param {object} data Child state data
     * @returns {MetaphorJs.lib.State}
     */
    $new: function(data) {
        return new State(extend({}, data, {
            $parent: this,
            $root: this.$root,
            $app: this.$app,
            $level: this.$level + 1,
            $static: this.$static
        }, true, false));
    },

    /**
     * Create child state with no relation to this state (no $parent)
     * but with $app propery set.
     * @method
     * @param {object} data Child state data
     * @returns {MetaphorJs.lib.State}
     */
    $newIsolated: function(data) {
        return new State(extend({}, data, {
            $app: this.$app,
            $level: this.$level + 1,
            $static: this.$static
        }, true, false));
    },

    /**
     * Freeze the state. It will not perfom checks and trigger change events
     * @method
     */
    $freeze: function() {
        if (!this.$$frozen) {
            this.$$frozen = true;
            this.$$observable.trigger("freeze", this);
        }
    },

    /**
     * Unfreeze state. Resume checking for changes
     * @method
     */
    $unfreeze: function() {
        if (this.$$frozen) {
            this.$$frozen = false;
            this.$$observable.trigger("unfreeze", this);
        }
    },

    /**
     * Subsrcibe to state events
     * @method 
     * @param {string} event
     * @param {function} fn
     * @param {object} context 
     */
    $on: function(event, fn, context) {
        return this.$$observable.on(event, fn, context);
    },

    /**
     * Unsubsrcibe from state events
     * @method 
     * @param {string} event
     * @param {function} fn
     * @param {object} context 
     */
    $un: function(event, fn, context) {
        return this.$$observable.un(event, fn, context);
    },

    /**
     * Create a watcher on js expression
     * @method
     * @param {string} expr js expression
     * @param {function} fn {
     *  @param {*} value
     * }
     * @param {object} context
     * @returns {MetaphorJs.lib.MutationObserver}
     */
    $watch: function(expr, fn, context) {
        return MetaphorJs.lib.MutationObserver.get(this, expr, fn, context);
    },

    /**
     * Stop watching js expression
     * @method
     * @param {string} expr js expression
     * @param {function} fn 
     * @param {object} context
     */
    $unwatch: function(expr, fn, context) {
        var mo = MetaphorJs.lib.MutationObserver.exists(this, expr);
        if (mo) {
            mo.unsubscribe(fn, context);
            mo.$destroy(true);
        }
    },

    /**
     * Watch changes in page url. Triggers regular change event
     * @method
     * @param {string} prop State property name
     * @param {string} param Url param name
     */
    $watchHistory: function(prop, param) {
        if (!this.$$historyWatchers[param]) {
            this.$$historyWatchers[param] = prop;
            MetaphorJs.lib.History.on("change-" + param, this.$$onHistoryChange, this);
        }
    },

    /**
     * Stop watching changes in page url.
     * @method
     * @param {string} param Url param name
     */
    $unwatchHistory: function(param) {
        if (!this.$$historyWatchers[param]) {
            delete this.$$historyWatchers[param];
            MetaphorJs.lib.History.un("change-" + param, this.$$onHistoryChange, this);
        }
    },


    /**
     * Set state value and check for changes.
     * @method
     * @param {string} key
     * @param {*} value
     */
     /**
     * Set state value and check for changes.
     * @method
     * @param {object} obj Key:value pairs
     */
    /**
     * Batch value update and check for changes.
     * @method
     * @param {function} fn fn(state)
     */
    $set: function(key, value) {
        if (typeof key === "string") {
            this[key] = value;
        }
        else if (typeof key === "function") {
            key(this);
        }
        else {
            for (let k in key) {
                this[k] = key[k];
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
        let prop;
        if (this.$$historyWatchers[name]) {
            prop = this.$$historyWatchers[name];
            this[prop] = val;
            this.$check();
        }
    },

    /**
     * Schedule a delayed check
     * @method
     * @param {int} timeout
     */
    $scheduleCheck: function(timeout) {
        if (!this.$$tmt) {
            this.$tmt = async(this.$check, this, null, timeout);
        }
    },

    /**
     * Check for changes and trigger change events.<br>
     * If changes are found, the check will run again
     * until no changes is found.
     * @method
     */
    $check: function() {
        let changes;

        if (this.$$checking || this.$static || this.$$frozen) {
            return;
        }
        this.$$checking = true;

        if (this.$$tmt) {
            clearTimeout(this.$$tmt);
            this.$$tmt = null;
        }

        if (this.$$mo) {
            changes = this.$$mo.$checkAll();
        }

        this.$$checking = false;

        if (!this.$$destroyed) {
            this.$$observable.trigger("check", changes);
        }

        if (changes > 0) {
            this.$$changing = true;
            this.$check();
        }
        else {
            // finished changing after all iterations
            if (this.$$changing) {
                this.$$changing = false;
                this.$$observable.trigger("changed");
            }
        }
    },

    /**
     * Register this state as public
     * @method
     * @param {string} name 
     */
    $registerPublic: function(name) {
        if (this.$$publicName || publicStates[name]) {
            return;
        }
        this.$$publicName = name;
        publicStates[name] = this;
    },

    /**
     * Register this state as default public
     * @method
     * @param {string} name 
     */
    $makePublicDefault: function() {
        this.$registerPublic("__default");
    },

    /**
     * Unregister public state
     * @method
     */
    $unregisterPublic: function() {
        const name = this.$$publicName;
        if (!name || !publicStates[name]) {
            return;
        }
        delete publicStates[name];
        this.$$publicName = null;
    },

    /**
     * Destroy state
     * @method
     */
    $destroy: function() {

        let param, i;

        if (this.$$destroyed) {
            return;
        }

        this.$$destroyed = true;
        this.$$observable.trigger("destroy");
        this.$$observable.$destroy();

        if (this.$parent && this.$parent.$un) {
            this.$parent.$un("check", this.$$onParentCheck, this);
            this.$parent.$un("destroy", this.$$onParentDestroy, this);
            this.$parent.$un("freeze", this.$freeze, this);
            this.$parent.$un("unfreeze", this.$unfreeze, this);
        }

        if (this.$$mo) {
            MetaphorJs.lib.MutationObserver.$destroy(this);
        }

        for (param in this.$$historyWatchers) {
            this.$unwatchHistory(param);
        }

        this.$unregisterPublic();

        for (i in this) {
            if (this.hasOwnProperty(i)) {
                this[i] = null;
            }
        }

        this.$$destroyed = true;
    }

}, true, false);

/**
 * Check if public state exists
 * @static
 * @method $exists
 * @param {string} name
 * @returns MetaphorJs.lib.State
 */
State.$exists = function(name) {
    return !!publicStates[name];    
};

/**
 * Get public state
 * @static
 * @method $get
 * @param {string} name - skip to get public default
 * @returns MetaphorJs.lib.State
 */
State.$get = function(name) {
    return publicStates[name || "__default"];
};

/**
 * Produce a state either by getting a public state,
 * or creating a child of public state or
 * creating a new state
 * @static
 * @method
 * @param {string|MetaphorJs.lib.State} name {
 *  @optional
 * }
 * @param {MetaphorJs.lib.State} parent {
 *  @optional
 * }
 * @returns MetaphorJs.lib.State
 */
State.$produce = function(name, parent) {

    if (name instanceof State) {
        return name;
    }

    if (!name) {
        if (parent) {
            return parent;
        }
        const def = publicStates['__default'];
        return def ? def.$new() : new State;
    }
    else {
        let action = "self";

        if (name.indexOf(":") !== -1) {
            let parts = name.split(":");
            name = parts[0];
            action = parts[1] || "self";
        }

        if (name) {
            parent = this.$get(name);
            if (!parent) {
                throw new Error("State with name " + name + " not found");
            }
        }

        switch (action) {
            case "self":
                return parent;
            case "new":
                return parent.$new();
            case "parent":
                return parent.$parent || parent.$root;
            case "root":
                return parent.$root;
            case "app":
                if (!parent.$app) {
                    throw new Error("App not found in state");
                }
                return parent.$app.state;
            default:
                throw new Error("Unknown state action: " + action);
        }
    }
};

return State;

}());
