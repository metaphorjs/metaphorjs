

var trim = require("../func/trim.js"),
    createWatchable = require("../../../metaphorjs-watchable/src/func/createWatchable.js"),
    Scope = require("../lib/Scope.js"),
    ns = require("../../../metaphorjs-namespace/src/var/ns.js"),
    defineClass = require("../../../metaphorjs-class/src/func/defineClass.js");


module.exports = defineClass("MetaphorJs.view.AttributeHandler", {

    watcher: null,
    scope: null,
    node: null,
    expr: null,

    initialize: function(scope, node, expr) {
        var self        = this;

        expr            = trim(expr);

        self.node       = node;
        self.expr       = expr;
        self.scope      = scope;
        self.watcher    = createWatchable(scope, expr, self.onChange, self, null, ns);

        if (self.watcher.getLastResult()) {
            self.onChange();
        }

        scope.$on("destroy", self.onScopeDestroy, self);
    },

    onScopeDestroy: function() {
        this.destroy();
    },

    onChange: function() {},

    destroy: function() {
        var self    = this;

        delete self.node;
        delete self.scope;

        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onChange, self);
            delete self.watcher;
        }
    }
});


