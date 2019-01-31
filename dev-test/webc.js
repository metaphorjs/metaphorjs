

require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/web-component/wrapper.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.MyComponent = MetaphorJs.app.Container.$extend({
    template: "my-component-tpl",

    initComponent: function() {
        this.$super();
    }
});

MetaphorJs.MyComponent.registerWebComponent("my-component");