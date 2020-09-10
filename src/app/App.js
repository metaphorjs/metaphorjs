require("../lib/State.js");
require("./Renderer.js");
require("../func/dom/getAttr.js");
require("../func/dom/removeAttr.js");
require("metaphorjs-shared/src/lib/LocalText.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-shared/src/mixin/Provider.js");
require("metaphorjs-observable/src/mixin/Observable.js");

const   cls = require("metaphorjs-class/src/cls.js"),
        MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
        emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
        toArray = require("metaphorjs-shared/src/func/toArray.js");

/**
 * @class MetaphorJs.app.App
 */
module.exports = MetaphorJs.app.App = cls({

    $mixins: [MetaphorJs.mixin.Observable, 
                MetaphorJs.mixin.Provider],

    lang: null,
    state: null,
    renderer: null,
    cmpPromises: null,
    cmpListeners: null,
    components: null,
    sourceObs: null,

    /**
     * @constructor
     * @method
     * @param {HTMLElement} node 
     * @param {object} data 
     */
    $init: function(node, data) {

        var self        = this,
            state       = data instanceof MetaphorJs.lib.State ? 
                                data : 
                                new MetaphorJs.lib.State(data),
            args;

        MetaphorJs.dom.removeAttr(node, "mjs-app");

        state.$app      = self;
        self.$super();

        self.lang       = new MetaphorJs.lib.LocalText;

        self.node           = node;
        self.state          = state;
        self.cmpListeners   = {};
        self.components     = {};
        self.cmpPromises    = {};
        self.$refs          = {node: {}, cmp: {}};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootState', state.$root);
        self.value('$lang', self.lang);
        self.value('$locale', self.lang);

        self.renderer       = new MetaphorJs.app.Renderer;
        self.renderer.on("rendered", self.afterRender, self);
        self.renderer.on("reference", self._onChildReference, self);

        args = toArray(arguments);
        args[1] = state;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    afterRender: function() {

    },

    _onChildReference: function(type, ref, item) {
        var self = this;
        if (!self.$refs[type]) {
            self.$refs[type] = {};
        }
        self.$refs[type][ref] = item;
    },

    /**
     * Start processing the DOM
     * @method
     */
    run: function() {
        this.renderer.process(this.node, this.state);
    },

    /**
     * Create data source gate
     * @param {string} name Source name
     * @param {string|bool} returnResult See MetaphorJs.lib.Observable.createEvent()
     */
    createSource: function(name, returnResult) {
        var key = "source-" + name,
            self = this;

        if (!self.$$observable.getEvent(key)) {
            self.$$observable.createEvent(key, returnResult || "nonempty");
        }
    },

    /**
     * Register data source
     * @param {string} name Source name
     * @param {function} fn Function yielding the data
     * @param {object} context fn's context
     */
    registerSource: function(name, fn, context) {
        this.on("source-" + name, fn, context);
    },

    /**
     * Unregister data source
     * @param {string} name Source name
     * @param {function} fn Data function
     * @param {object} context fn's context
     */
    unregisterSource: function(name, fn, context) {
        this.un("source-" + name, fn, context);
    },

    /**
     * Collect data from data source
     * @param {string} name Source name
     * @returns {object|array}
     */
    collect: function(name) {
        arguments[0] = "source-" + arguments[0];
        return this.trigger.apply(this, arguments);
    },

    /**
     * Get parent component for given node
     * @param {HTMLElement} node 
     * @param {bool} includeSelf 
     * @returns {MetaphorJs.app.Component}
     */
    getParentCmp: function(node, includeSelf) {

        var self    = this,
            parent  = includeSelf ? node : node.parentNode,
            id;

        while (parent && parent !== window.document.documentElement) {
            //if (id = (MetaphorJs.dom.getAttr(parent, "cmp-id") || parent.$$cmpId)) {
            if (id = parent.$$cmpId) {
                return self.getCmp(id);
            }
            parent = parent.parentNode;
        }

        return null;
    },

    /**
     * Get referenced node from top level
     * @param {string} name 
     * @returns Node|null
     */
    getRefEl: function(name) {
        return this.$refs['node'][name];
    },

    /**
     * Register callback for when component becomes available
     * @param {string} id 
     * @param {function} fn 
     * @param {object} context 
     * @returns {MetaphorJs.lib.Promise}
     */
    onAvailable: function(id, fn, context) {

        var self = this,
            promises = self.cmpPromises,
            components = self.components,
            ev = "available-" + id;

        self.$$observable.createEvent(ev);

        if (fn) {
            self.$$observable.on(ev, fn, context);
        }

        if (!promises[id]) {
            promises[id] = new MetaphorJs.lib.Promise;
            self.$$observable.once(ev, promises[id].resolve, promises[id]);
        }

        if (components[id]) {
            self.$$observable.trigger(ev, components[id]);
        }

        return promises[id];
    },

    /**
     * Get component
     * @param {string} id 
     * @returns {MetaphorJs.app.Component}
     */
    getCmp: function(id) {
        return this.components[id] || null;
    },

    /**
     * Register component
     * @param {MetaphorJs.app.Component} cmp 
     * @param {string} byKey 
     */
    registerCmp: function(cmp, byKey) {
        var self = this,
            id = cmp[byKey],
            ev = "available-" + id,
            deregister = function() {
                delete self.cmpPromises[id];
                delete self.components[id];
            };

        self.components[id] = cmp;
        self.$$observable.trigger(ev, cmp);

        if (cmp.on) {
            cmp.on("destroy", deregister);
        }
    },

    onDestroy: function() {

        var self    = this;

        self.renderer.$destroy();
        self.state.$destroy();
        self.lang.$destroy();

        self.$super();
    }

});

