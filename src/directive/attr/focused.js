
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/removeListener.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");


Directive.registerAttribute("focused", 600, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.InFocus",
    id: "focused",

    _initConfig: function() {
        this.config.setMode("value", MetaphorJs.lib.Config.MODE_SETTER);
        this.$super();
    },

    _initChange: function() {},

    _initDirective: function() {

        this.focusDelegate = bind(this.onInputFocus, this);
        this.blurDelegate = bind(this.onInputBlur, this);

        MetaphorJs.dom.addListener(this.node, "focus", this.focusDelegate);
        MetaphorJs.dom.addListener(this.node, "blur", this.blurDelegate);
    },

    onInputFocus: function() {
        this.config.get("value")(this.scope, true);
    },
    onInputBlur: function() {
        this.config.get("value")(this.scope, false);
    },

    onDestroy: function(){
        MetaphorJs.dom.removeListener(this.node, "focus", this.focusDelegate);
        MetaphorJs.dom.removeListener(this.node, "blur", this.blurDelegate);
        this.$super();
    }
}));
