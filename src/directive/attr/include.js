
require("../../app/Template.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("include", 1100,
    function(scope, node, config, parentRenderer, attrSet){

    config.disableProperty("value");
    config.setProperty("name", config.getProperty("value"));
    config.removeProperty("value");
    config.enableProperty("name");
    config.setType("asis", "bool", MetaphorJs.lib.Config.MODE_STATIC);
    config.setDefaultValue("runRenderer", !config.get("asis"));

    var tpl = new MetaphorJs.app.Template({
        scope: scope,
        attachTo: node,
        parentRenderer: parentRenderer,
        config: config
    });

    parentRenderer.on("destroy", function(){
        tpl.$destroy();
        tpl = null;
    });

    return false; // stop renderer
});
