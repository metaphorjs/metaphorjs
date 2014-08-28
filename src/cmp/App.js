

var defineClass = require("../../../metaphorjs-class/src/func/defineClass.js"),
    bind = require("../func/bind.js"),
    extend = require("../func/extend.js"),
    emptyFn = require("../func/emptyFn.js"),
    slice = require("../func/array/slice.js"),
    resolveComponent = require("../func/resolveComponent.js"),
    Scope = require("../lib/Scope.js"),
    Renderer = require("../view/Renderer.js"),
    Observable = require("../../../metaphorjs-observable/src/metaphorjs.observable.js"),
    Provider = require("../lib/Provider.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js"),
    Text = require("../lib/Text.js");

require("./Base.js");


defineClass("MetaphorJs.cmp.App", "MetaphorJs.cmp.Base", {

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,

    initialize: function(node, data) {

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

            if (id = parent.getAttribute("cmp-id")) {
                return self.getCmp(id);
            }

            parent = parent.parentNode;
        }

        return null;
    },

    onAvailable: function(cmpId, fn, context) {

        var cmpListeners = this.cmpListeners;

        if (!cmpListeners[cmpId]) {
            cmpListeners[cmpId] = new Promise;
        }

        if (fn) {
            cmpListeners[cmpId].done(fn, context);
        }

        return cmpListeners[cmpId];
    },

    getCmp: function(id) {
        return this.components[id] || null;
    },

    registerCmp: function(cmp) {
        var self = this;

        self.components[cmp.id] = cmp;

        self.onAvailable(cmp.id).resolve(cmp);

        cmp.on("destroy", function(cmp){
            delete self.cmpListeners[cmp.id];
            delete self.components[cmp.id];
        });
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
                delete self[i];
            }
        }
    }

});

