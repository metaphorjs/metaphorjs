

var defineClass = require("../../../metaphorjs-class/src/func/defineClass.js"),
    bind = require("../func/bind.js"),
    extend = require("../func/extend.js"),
    nextUid = require("../func/nextUid.js"),
    emptyFn = require("../func/emptyFn.js"),
    slice = require("../func/array/slice.js"),
    getAttr = require("../func/dom/getAttr.js"),
    Scope = require("../lib/Scope.js"),
    Renderer = require("../view/Renderer.js"),
    Observable = require("../../../metaphorjs-observable/src/metaphorjs.observable.js"),
    Provider = require("../lib/Provider.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js"),
    Text = require("../lib/Text.js");

require("./Base.js");

module.exports = defineClass({

    $class: "MetaphorJs.cmp.App",
    $extends: "MetaphorJs.cmp.Base",

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,

    $init: function(node, data) {

        var self        = this,
            scope       = data instanceof Scope ? data : new Scope(data),
            provider,
            observable,
            args;

        scope.$app      = self;
        self.supr();

        provider        = new Provider;
        observable      = new Observable;
        self.lang       = new Text;

        // provider's storage is hidden from everyone
        extend(self, provider.getApi(), true, false);
        self.destroyProvider    = bind(provider.destroy, provider);

        extend(self, observable.getApi(), true, false);
        self.destroyObservable  = bind(observable.destroy, observable);

        self.scope          = scope;
        self.cmpListeners   = {};
        self.components     = {};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootScope', scope.$root);
        self.value('$lang', self.lang);

        self.renderer       = new Renderer(node, scope);

        args = slice.call(arguments);
        args[1] = scope;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    run: function() {
        this.renderer.process();
    },


    getParentCmp: function(node) {

        var self    = this,
            parent  = node.parentNode,
            id;

        while (parent) {

            if (id = getAttr(parent, "cmp-id")) {
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
            cmpListeners[cmpId] = new Promise;
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

    destroy: function() {

        var self    = this,
            i;

        self.destroyObservable();
        self.destroyProvider();
        self.renderer.destroy();
        self.scope.$destroy();

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }

        self.supr();
    }

});

