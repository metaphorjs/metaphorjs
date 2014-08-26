

(function(){

    var m                   = window.MetaphorJs,
        dataFn              = m.data,
        currentUrl          = m.currentUrl,
        toFragment          = m.toFragment,
        animate             = m.animate,
        extend              = m.extend,
        stop                = m.stopAnimation,
        resolveComponent    = m.resolveComponent,
        createWatchable     = m.lib.Watchable.create;

    MetaphorJs.define("MetaphorJs.cmp.View", {

        /**
         * [
         *  {
         *      reg: /.../,
         *      cmp: 'Cmp.Name',
         *      params: [name, name...], // param index in array is the same as reg match number - 1
         *      template: '',
         *      isolateScope: bool
         *  }
         * ]
         */
        route: null,
        node: null,
        scope: null,
        cmp: null,

        currentComponent: null,
        watchable: null,
        defaultCmp: null,

        initialize: function(cfg)  {

            var self    = this;

            extend(self, cfg, true);

            var node = self.node;

            if (node && node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            if (!self.cmp) {
                self.cmp = node.getAttribute("mjs-view-cmp");
            }

            self.defaultCmp = node.getAttribute("mjs-view-default");

            node.removeAttribute("mjs-view");
            node.removeAttribute("mjs-view-cmp");
            node.removeAttribute("mjs-view-default");

            if (self.route) {
                history.initPushState();
                MetaphorJs.on("locationChange", self.onLocationChange, self);
                self.onLocationChange();
            }
            else if (self.cmp) {
                self.watchable = createWatchable(self.scope, self.cmp, self.onCmpChange, self);
                self.onCmpChange();
            }
        },

        onCmpChange: function() {

            var self    = this,
                cmp     = self.watchable.getLastResult() || self.defaultCmp;

            self.clearComponent();

            if (cmp) {
                self.setComponent(cmp);
            }
        },

        onLocationChange: function() {

            var self    = this,
                url     = currentUrl(),
                routes  = self.route,
                def,
                i, len,
                r, matches;

            for (i = 0, len = routes.length; i < len; i++) {
                r = routes[i];
                matches = url.match(r.reg);

                if (matches) {
                    self.changeRouteComponent(r, matches);
                    return;
                }
                if (r['default'] && !def) {
                    def = r;
                }
            }

            if (def) {
                self.setRouteComponent(def, []);
            }
            else {
                self.clearComponent();
            }

            if (!def && self.defaultCmp) {
                self.setComponent(self.defaultCmp);
            }
        },

        changeRouteComponent: function(route, matches) {
            var self = this;
            stop(self.node);
            self.clearComponent();
            self.setRouteComponent(route, matches);
        },

        clearComponent: function() {
            var self    = this,
                node    = self.node;

            if (self.currentComponent) {

                animate(node, "leave", null, true).done(function(){

                    self.currentComponent.destroy();
                    self.currentComponent = null;

                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                });
            }

        },

        setRouteComponent: function(route, matches) {

            var self    = this,
                node    = self.node,
                params  = route.params;

            animate(node, "enter", function(){

                var args    = matches || [],
                    cfg     = {
                        destroyEl: false,
                        node: node,
                        scope: route.isolateScope ?
                               self.scope.$newIsolated() :
                               self.scope.$new()
                    },
                    i, l;

                if (route.as) {
                    cfg.as = route.as;
                }
                if (route.template) {
                    cfg.template = route.template;
                }

                args.shift();

                if (params) {
                    for (i = -1, l = params.length; ++i < l; cfg[params[i]] = args[i]){}
                }

                return resolveComponent(
                        route.cmp || "MetaphorJs.cmp.Component",
                        cfg,
                        cfg.scope,
                        node,
                        null,
                        args
                    )
                    .done(function(newCmp){
                        self.currentComponent = newCmp;
                    });

            }, true);
        },

        setComponent: function(cmp) {

            var self    = this,
                node    = self.node;

            animate(node, "enter", function(){

                var cfg     = typeof cmp == "object" ? cmp : {},
                    cls     = (typeof cmp == "string" ? cmp : null) || "MetaphorJs.cmp.Component",
                    scope   = cfg.scope || self.scope.$new();

                cfg.destroyEl = false;

                return resolveComponent(cls, cfg, scope, node).done(function(newCmp){
                    self.currentComponent = newCmp;
                });

            }, true);
        },

        destroy: function() {

            var self    = this;

            self.clearComponent();

            if (self.route) {
                MetaphorJs.un("locationchange", self.onLocationChange, self);
                delete self.route;
            }

            if (self.watchable) {
                self.watchable.unsubscribeAndDestroy(self.onCmpChange, self);
                delete self.watchable;
            }

            delete self.scope;
            delete self.currentComponent;
        }
    });

}());

