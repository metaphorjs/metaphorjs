

(function(){

    var dataFn      = MetaphorJs.data,
        currentUrl  = MetaphorJs.currentUrl,
        toFragment  = MetaphorJs.toFragment,
        g           = MetaphorJs.ns.get,
        animate     = MetaphorJs.animate,
        Scope       = MetaphorJs.lib.Scope,
        apply       = MetaphorJs.apply,
        stop        = MetaphorJs.stopAnimation;

    MetaphorJs.define("MetaphorJs.cmp.View", {

        /**
         * [
         *  {
         *      reg: /.../,
         *      cmp: 'Cmp.Name',
         *      isolateScope: bool
         *  }
         * ]
         */
        route: null,
        node: null,
        scope: null,

        currentComponent: null,

        initialize: function(cfg)  {

            var self    = this;

            apply(self, cfg, true);

            MetaphorJs.on("locationchange", self.onLocationChange, self);

            var node = self.node;

            if (node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            this.onLocationChange();
        },

        onLocationChange: function() {

            var self    = this,
                url     = currentUrl(),
                routes  = self.route,
                i, len,
                r, matches;

            for (i = 0, len = routes.length; i < len; i++) {
                r = routes[i];
                matches = url.match(r.reg);

                if (matches) {
                    self.changeComponent(r, matches);
                    return;
                }
            }

            self.clearComponent();
        },

        changeComponent: function(route, matches) {
            stop(this.node);
            this.clearComponent();
            this.setComponent(route, matches);
        },

        clearComponent: function() {
            var self    = this,
                node    = self.node;

            if (self.currentComponent) {
                animate(node, "leave").done(function(){
                    self.currentComponent.destroy();
                    self.currentComponent = null;
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                });
            }
        },

        setComponent: function(route, matches) {

            var self    = this,
                node    = self.node;

            animate(node, "enter", function(){

                var constr  = g(route.cmp || "MetaphorJs.cmp.Component"),
                    args    = matches,
                    cfg     = {
                        destroyEl: false,
                        node: node,
                        scope: route.isolateScope ? new Scope : self.scope.$new()
                    };

                if (route.template) {
                    cfg.template = route.template;
                }

                args.shift();
                args.unshift(cfg);
                self.currentComponent = constr.__instantiate.apply(null, args);
                return self.currentComponent.initPromise;
            });
        }
    });

}());

