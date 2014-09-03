
var Observable = require("../../../metaphorjs-observable/src/metaphorjs.observable.js"),
    Watchable = require("../../../metaphorjs-watchable/src/metaphorjs.watchable.js"),
    extend = require("../func/extend.js"),
    undf = require("../var/undf.js");

var Scope = function(cfg) {
    var self    = this;

    self.$$observable    = new Observable;

    extend(self, cfg, true, false);

    if (self.$parent) {
        self.$parent.$on("check", self.$$onParentCheck, self);
        self.$parent.$on("destroy", self.$$onParentDestroy, self);
    }
    else {
        self.$root  = self;
        self.$isRoot= true;
    }
};

Scope.prototype = {

    $app: null,
    $parent: null,
    $root: null,
    $isRoot: false,
    $$observable: null,
    $$watchers: null,
    $$checking: false,
    $$destroyed: false,

    $new: function() {
        var self = this;
        return new Scope({
            $parent: self,
            $root: self.$root,
            $app: self.$app
        });
    },

    $newIsolated: function() {
        return new Scope({
            $app: this.$app
        });
    },

    $on: function(event, fn, fnScope) {
        return this.$$observable.on(event, fn, fnScope);
    },

    $un: function(event, fn, fnScope) {
        return this.$$observable.un(event, fn, fnScope);
    },

    $watch: function(expr, fn, fnScope) {
        return Watchable.create(this, expr, fn, fnScope, null);
    },

    $unwatch: function(expr, fn, fnScope) {
        return Watchable.unsubscribeAndDestroy(this, expr, fn, fnScope);
    },

    $get: function(key) {

        var s       = this;

        while (s) {
            if (s[key] !== undf) {
                return s[key];
            }
            s       = s.$parent;
        }

        return undf;
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

};


module.exports = Scope;