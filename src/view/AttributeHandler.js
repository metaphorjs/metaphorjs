

var trim = require("../func/trim.js"),
    createWatchable = require("../../../metaphorjs-watchable/src/func/createWatchable.js"),
    Scope = require("../lib/Scope.js"),
    undf = require("../var/undf.js"),
    ns = require("../../../metaphorjs-namespace/src/var/ns.js"),
    defineClass = require("../../../metaphorjs-class/src/func/defineClass.js");


module.exports = defineClass({

    $class: "MetaphorJs.view.AttributeHandler",

    watcher: null,
    scope: null,
    node: null,
    expr: null,

    autoOnChange: true,

    $init: function(scope, node, expr) {

        var self        = this,
            val;

        expr            = trim(expr);

        self.node       = node;
        self.expr       = expr;
        self.scope      = scope;
        self.watcher    = createWatchable(scope, expr, self.onChange, self, null, ns);

        if (self.autoOnChange && (val = self.watcher.getLastResult()) != undf) {
            self.onChange(val, undf);
        }

        scope.$on("destroy", self.onScopeDestroy, self);
    },

    onScopeDestroy: function() {
        this.destroy();
    },

    onChange: function() {},

    destroy: function() {
        var self    = this;

        self.node = null;
        self.scope = null;

        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onChange, self);
            self.watcher = null;
        }

        self.supr();
    }
});


