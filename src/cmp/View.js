

(function(){

    var dataFn      = MetaphorJs.data,
        currentUrl  = MetaphorJs.currentUrl,
        toFragment  = MetaphorJs.toFragment,
        animate     = MetaphorJs.animate,
        Scope       = MetaphorJs.lib.Scope,
        extend      = MetaphorJs.extend,
        stop        = MetaphorJs.stopAnimation,
        resolveComponent    = MetaphorJs.resolveComponent;

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

        currentComponent: null,

        initialize: function(cfg)  {

            var self    = this;

            history.initPushState();

            extend(self, cfg, true);

            MetaphorJs.on("locationchange", self.onLocationChange, self);

            var node = self.node;

            if (node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            node.removeAttribute("mjs-view");

            this.onLocationChange();
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
                    self.changeComponent(r, matches);
                    return;
                }
                if (r['default'] && !def) {
                    def = r;
                }
            }

            if (def) {
                self.changeComponent(def, []);
            }
            else {
                self.clearComponent();
            }
        },

        changeComponent: function(route, matches) {
            var self = this;
            stop(self.node);
            self.clearComponent();
            self.setComponent(route, matches);
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

        setComponent: function(route, matches) {

            var self    = this,
                node    = self.node,
                params  = route.params;

            animate(node, "enter", function(){

                var args    = matches || [],
                    cfg     = {
                        destroyEl: false,
                        node: node,
                        scope: route.isolateScope ?
                               new Scope({$app: self.scope.$app}) :
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
        }
    });

}());

