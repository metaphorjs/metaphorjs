

require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/web-component/wrapper.js");
require("metaphorjs/src/lib/Scope.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

var rootScope = new MetaphorJs.lib.Scope;
rootScope.$registerPublic("root");
rootScope.text = "Hello world!";
rootScope.a = 1;

var childScope = rootScope.$new();
childScope.$registerPublic("child");

MetaphorJs.MyComponent = MetaphorJs.app.Container.$extend({
    template: "my-component-tpl",

    initComponent: function() {
        this.$super();
    }
});

MetaphorJs.MyComponent.registerWebComponent("my-component");