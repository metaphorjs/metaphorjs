require("../../func/dom/getAttr.js");
require("../../app/Template.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerTag("include", function(){
    var dir = function tag_include_directive(scope, node, config, renderer) {

        dir.initConfig(config);
    
        var tpl = new MetaphorJs.app.Template({
            scope: scope,
            replaceNode: node,
            config: config,
            parentRenderer: renderer
        });
    
        if (renderer) {
            renderer.on("destroy", function(){
                tpl.$destroy();
                tpl = null;
            });
    
            renderer.flowControl("ignoreInside", true);
        }
    };

    dir.initConfig = function(config) {
        config.setType("asis", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultValue("runRenderer", !config.get("asis"));
        config.set("useComments", true);
        config.set("passReferences", true);
    };

    return dir;
}());
