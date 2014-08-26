//#require ../func/createWatchable.js
//#require ../func/trim.js
//#require ../func/class/defineClass.js
//#require ../vars/Scope.js

defineClass("MetaphorJs.view.AttributeHandler", {

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
        self.watcher    = createWatchable(scope, expr, self.onChange, self);

        if (self.watcher.getLastResult()) {
            self.onChange();
        }

        if (scope instanceof Scope) {
            scope.$on("destroy", self.onScopeDestroy, self);
        }
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