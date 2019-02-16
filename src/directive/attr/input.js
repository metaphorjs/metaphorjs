require("../../lib/Scope.js");
require("../../lib/Expression.js");
require("../../lib/MutationObserver.js");
require("../../lib/Config.js");
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");

var Directive = require("../../app/Directive.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("input", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Model",
    id: "input",
    _apis: ["node", "input"],

    _inProg: false,
    _prev: null,

    initDirective: function() {

        var self    = this;

        self.input.onChange(self.onInputChange, self);
        self._prev = self.input.getValue();
        self.$super();
    },

    initChange: function(){},

    initConfig: function() {
        this.config.setType("if", "bool");
        this.config.setMode("value", MetaphorJs.lib.Config.MODE_FUNC);
    },

    initChange: emptyFn,

    onOptionsChange: function() {
        this.onScopeChange();
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope,
            config  = self.config;

        if (config.has("if") && !config.get("if")) {
            return;
        }
        if (self._prev == val || self._inProg) {
            return;
        }

        self._inProg = true;

        var fn = config.get("value");
        scope.$prev = self._prev;
        scope.$value = val;
        fn(scope);
        scope.$prev = null;
        scope.$value = null;

        config.checkScope("value");
        self._prev = val;
        self._inProg = false;
    },

    onDestroy: function() {
        var self        = this;

        self.input.unChange(self.onInputChange, self);
        self.input.$destroy();
        self.input = null;

        self.$super();
    }


}, {

    $prebuild: {
        skip: true
    }

}));