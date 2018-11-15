require("../../func/dom/getAttr.js");
require("../../app/Template.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerTag("include", function(scope, node, config, parentRenderer, attrSet) {

    config.setProperty("asis", {type: "bool"});
    config.lateInit();

    var tpl = new MetaphorJs.app.Template({
        scope: scope,
        node: node,
        url: MetaphorJs.dom.getAttr(node, "src"),
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
