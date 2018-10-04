require("../lib/Plural.js");
require("../lib/Scope.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-shared/src/mixin/Provider.js");
require("metaphorjs-observable/src/mixin/Observable.js");

var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    getAttr = require("../func/dom/getAttr.js"),
    Renderer = require("../class/Renderer.js"),
    removeAttr = require("../func/dom/removeAttr.js");


module.exports = MetaphorJs.App = cls({

    $class: "MetaphorJs.App",
    $mixins: [MetaphorJs.mixin.Observable, 
                MetaphorJs.lib.Provider],

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,
    sourceObs: null,

    $init: function(node, data) {

        var self        = this,
            scope       = data instanceof MetaphorJs.lib.Scope ? 
                                data : 
                                new MetaphorJs.lib.Scope(data),
            args;

        removeAttr(node, "mjs-app");

        scope.$app      = self;
        self.$super();

        self.lang       = new MetaphorJs.lib.Plural;

        self.scope          = scope;
        self.cmpListeners   = {};
        self.components     = {};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootScope', scope.$root);
        self.value('$lang', self.lang);

        self.renderer       = new Renderer(node, scope);
        self.renderer.on("rendered", self.afterRender, self);

        args = toArray(arguments);
        args[1] = scope;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    afterRender: function() {

    },

    run: function() {
        this.renderer.process();
    },

    createSource: function(name, returnResult) {
        var key = "source-" + name,
            self = this;

        if (!self.$$observable.getEvent(key)) {
            self.$$observable.createEvent(key, returnResult || "nonempty");
        }
    },

    registerSource: function(name, fn, context) {
        this.on("source-" + name, fn, context);
    },

    unregisterSource: function(name, fn, context) {
        this.un("source-" + name, fn, context);
    },

    collect: function(name) {
        arguments[0] = "source-" + arguments[0];
        return this.trigger.apply(this, arguments);
    },


    getParentCmp: function(node, includeSelf) {

        var self    = this,
            parent  = includeSelf ? node : node.parentNode,
            id;

        while (parent) {
            if (id = (getAttr(parent, "cmp-id") || parent.$$cmpId)) {
                return self.getCmp(id);
            }
            parent = parent.parentNode;
        }

        return null;
    },

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

    getCmp: function(id) {
        return this.components[id] || null;
    },

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
        scope.$on("$destroy", deregister);
    },

    onDestroy: function() {

        var self    = this;

        self.renderer.$destroy();
        self.scope.$destroy();
        self.lang.$destroy();

        self.$super();
    }

});

