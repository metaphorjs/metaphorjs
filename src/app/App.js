require("../lib/Scope.js");
require("./Renderer.js");
require("../func/dom/getAttr.js");
require("../func/dom/removeAttr.js");
require("metaphorjs-shared/src/lib/LocalText.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-shared/src/mixin/Provider.js");
require("metaphorjs-observable/src/mixin/Observable.js");

var cls = require("metaphorjs-class/src/cls.js"),
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
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,
    sourceObs: null,

    /**
     * @constructor
     * @method
     * @param {Node} node 
     * @param {object} data 
     */
    $init: function(node, data) {

        var self        = this,
            scope       = data instanceof MetaphorJs.lib.Scope ? 
                                data : 
                                new MetaphorJs.lib.Scope(data),
            args;

        MetaphorJs.dom.removeAttr(node, "mjs-app");

        scope.$app      = self;
        self.$super();

        self.lang       = new MetaphorJs.lib.LocalText;

        self.scope          = scope;
        self.cmpListeners   = {};
        self.components     = {};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootScope', scope.$root);
        self.value('$lang', self.lang);
        self.value('$locale', self.lang);

        self.renderer       = new MetaphorJs.app.Renderer(node, scope);
        self.renderer.on("rendered", self.afterRender, self);

        args = toArray(arguments);
        args[1] = scope;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    afterRender: function() {

    },

    /**
     * Start processing the DOM
     * @method
     */
    run: function() {
        this.renderer.process();
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
     * @param {Node} node 
     * @param {bool} includeSelf 
     * @returns {MetaphorJs.app.Component}
     */
    getParentCmp: function(node, includeSelf) {

        var self    = this,
            parent  = includeSelf ? node : node.parentNode,
            id;

        while (parent) {
            if (id = (MetaphorJs.dom.getAttr(parent, "cmp-id") || parent.$$cmpId)) {
                return self.getCmp(id);
            }
            parent = parent.parentNode;
        }

        return null;
    },

    /**
     * Register callback for when component becomes available
     * @param {string} cmpId 
     * @param {function} fn 
     * @param {object} context 
     * @returns {MetaphorJs.lib.Promise}
     */
    onAvailable: function(cmpId, fn, context) {

        var self = this,
            cmpListeners = self.cmpListeners,
            components = self.components;

        if (!cmpListeners[cmpId]) {
            cmpListeners[cmpId] = new MetaphorJs.lib.Promise;
        }

        if (fn) {
            cmpListeners[cmpId].done(fn, context);
        }

        if (components[cmpId]) {
            cmpListeners[cmpId].resolve(components[cmpId])
        }

        return cmpListeners[cmpId];
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
     * @param {MetaphorJs.lib.Scope} scope 
     * @param {string} byKey 
     */
    registerCmp: function(cmp, scope, byKey) {
        var self = this,
            id = cmp[byKey],
            deregister = function() {
                delete self.cmpListeners[id];
                delete self.components[id];
            };

        self.components[id] = cmp;

        if (self.cmpListeners[id]) {
            self.cmpListeners[id].resolve(cmp);
        }

        if (cmp.on) {
            cmp.on("destroy", deregister);
        }
        scope.$on("destroy", deregister);
    },

    onDestroy: function() {

        var self    = this;

        self.renderer.$destroy();
        self.scope.$destroy();
        self.lang.$destroy();

        self.$super();
    }

});

