
(function(){

    var Observable  = MetaphorJs.lib.Observable,
        Watchable   = MetaphorJs.lib.Watchable,
        extend      = MetaphorJs.extend,
        Scope;

    Scope = MetaphorJs.d("MetaphorJs.view.Scope", {

        $app: null,
        $parent: null,
        $root: null,
        $isRoot: false,
        $$observable: null,
        $$watchers: null,
        $$checking: false,
        $$destroyed: false,

        initialize: function(cfg) {

            var self    = this;

            self.$$observable    = new Observable;

            extend(self, cfg, true);

            if (self.$parent) {
                self.$parent.$on("check", self.$$onParentCheck, self);
                self.$parent.$on("destroy", self.$$onParentDestroy, self);
            }
            else {
                self.$root  = self;
                self.$isRoot= true;
            }
        },

        $new: function() {
            var self = this;
            return new Scope({
                $parent: self,
                $root: self.$root,
                $app: self.$app
            });
        },

        $on: function(event, fn, fnScope) {
            return this.$$observable.on(event, fn, fnScope);
        },

        $un: function(event, fn, fnScope) {
            return this.$$observable.un(event, fn, fnScope);
        },

        $watch: function(expr, fn, fnScope) {
            Watchable.create(this, expr, fn, fnScope, null);
        },

        $unwatch: function(expr, fn, fnScope) {
            Watchable.unsubscribeAndDestroy(this, expr, fn, fnScope);
        },

        $get: function(key) {

            var s       = this;

            while (s) {
                if (s[key] != undefined) {
                    return s[key];
                }
                s       = s.$parent;
            }

            return undefined;
        },

        $$onParentDestroy: function() {
            this.$destroy();
        },

        $$onParentCheck: function() {
            this.$check();
        },

        $check: function() {
            var self = this,
                changes;

            if (self.$$checking) {
                return;
            }
            self.$$checking = true;

            if (self.$$watchers) {
                changes = self.$$watchers.$checkAll();
            }

            self.$$checking = false;

            if (!self.$$destroyed) {
                self.$$observable.trigger("check", changes);
            }
        },

        $destroy: function() {

            var self    = this;

            self.$$observable.trigger("destroy");

            self.$$observable.destroy();
            delete self.$$observable;
            delete self.$app;
            delete self.$root;
            delete self.$parent;

            if (self.$$watchers) {
                self.$$watchers.$destroyAll();
                delete self.$$watchers;
            }

            self.$$destroyed = true;
        }

    });
}());