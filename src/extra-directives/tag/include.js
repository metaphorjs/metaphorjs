require("../../func/dom/getAttr.js");
require("../../app/Template.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerTag("include", function(scope, node, config, parentRenderer) {

    config.setType("asis", "bool", MetaphorJs.lib.Config.MODE_STATIC);
    config.setDefaultValue("runRenderer", !config.get("asis"));
    config.set("wrapInComments", true);
    config.set("replaceNode", true);

    var tpl = new MetaphorJs.app.Template({
        scope: scope,
        node: node,
        config: config,
        parentRenderer: parentRenderer
    });

    parentRenderer.on("destroy", function(){
        tpl.$destroy();
        tpl = null;
    });

    return false; // stop renderer
});
