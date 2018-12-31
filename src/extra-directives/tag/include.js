require("../../func/dom/getAttr.js");
require("../../app/Template.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerTag("include", function(scope, node, config, parentRenderer) {

    config.setType("asis", "bool", MetaphorJs.lib.Config.MODE_STATIC);

    var tpl = new MetaphorJs.app.Template({
        scope: scope,
        node: node,
        config: config,
        parentRenderer: parentRenderer,
        replace: true,
        ownRenderer: !config.get("asis") // if asis, do not render stuff
    });

    parentRenderer.on("destroy", function(){
        tpl.$destroy();
        tpl = null;
    });

    return false; // stop renderer
});
