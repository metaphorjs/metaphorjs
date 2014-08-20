

(function(){

    var m           = window.MetaphorJs,
        Scope       = m.view.Scope,
        Renderer    = m.view.Renderer,
        Provider    = m.lib.Provider,
        Observable  = m.lib.Observable,
        Promise     = m.lib.Promise,
        bind        = m.bind,
        extend      = m.extend;

    MetaphorJs.define("MetaphorJs.cmp.App", "MetaphorJs.cmp.Base", {

        scope: null,
        renderer: null,
        cmpListeners: null,
        components: null,

        initialize: function(node, data) {

            var self        = this,
                scope       = data instanceof Scope ? data : new Scope(data),
                provider,
                observable;

            scope.$app      = self;
            self.supr();

            provider        = new Provider(scope);
            observable      = new Observable;

            // provider's storage is hidden from everyone
            extend(self, provider.getApi());
            self.destroyProvider    = bind(provider.destroy, provider);

            extend(self, observable.getApi());
            self.destroyObservable  = bind(observable.destroy, observable);

            self.scope          = scope;
            self.cmpListeners   = {};
            self.components     = {};

            self.renderer       = new Renderer(node, scope);

            self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        },

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

}());