

var Directive = require("../../class/Directive.js"),
    toBool = require("../../func/toBool.js"),
    Template = require("../../class/Template.js");

Directive.registerAttribute("include", 1100,
    function(scope, node, config, parentRenderer, attrSet){

    config.setProperty("asis", {type: "bool"});
    config.setProperty("animate", {type: "bool"});
    config.lateInit();

    var html = config.get("html"),
        tplCfg = {
            scope: scope,
            node: node,
            parentRenderer: parentRenderer,
            animate: config.get("animate"),
            ownRenderer: !config.get("asis") // do not render if asis=true
        };

    if (html) {
        tplCfg['html'] = html;
    }
    else {
        tplCfg['url'] = config.get("value");
    }

    var tpl = new Template(tplCfg);

    parentRenderer.on("destroy", function(){
        tpl.$destroy();
        tpl = null;
    });

    return false; // stop renderer
});
