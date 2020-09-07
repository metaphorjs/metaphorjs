
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");
require("../../lib/Config.js");

const Directive = require("../../app/Directive.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("focused", 600, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.InFocus",
    id: "focused",

    initChange: function() {},

    initDirective: function() {

        this.focusDelegate = bind(this.onInputFocus, this);
        this.blurDelegate = bind(this.onInputBlur, this);

        MetaphorJs.dom.addListener(this.node, "focus", this.focusDelegate);
        MetaphorJs.dom.addListener(this.node, "blur", this.blurDelegate);
    },

    onInputFocus: function() {
        this.config.get("value")(this.scope, true);
        this.scope.$check();
    },
    onInputBlur: function() {
        this.config.get("value")(this.scope, false);
        this.scope.$check();
    },

    onDestroy: function(){
        MetaphorJs.dom.removeListener(this.node, "focus", this.focusDelegate);
        MetaphorJs.dom.removeListener(this.node, "blur", this.blurDelegate);
        this.$super();
    }
}, {
    initConfig: function(config) {
        config.setMode("value", MetaphorJs.lib.Config.MODE_SETTER);
    }
}));
