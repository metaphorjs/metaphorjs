require("../../lib/EventHandler.js");
require("../../lib/Expression.js");
require("../../lib/Input.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress',
                  'change',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'load', 'mousewheel',
                  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'],
        i, len;

    var prepareConfig = function(config) {
        config.setProperty("preventDefault", {
            type: "bool", 
            defaultValue: true,
            defaultMode: MetaphorJs.lib.Config.MODE_STATIC
        });
        config.setType("stopPropagation", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("if", "bool");
        config.eachProperty(function(k){
            if (k === 'value' || k.indexOf('value.') === 0) {
                config.setMode(k, MetaphorJs.lib.Config.MODE_FUNC);
            }
        });
        return config;
    };

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute(name, 1000,
                function(scope, node, config, renderer, attrSet) {

                if (node.getDomApi) {
                    config.setProperty("targetComponent", {
                        mode: MetaphorJs.lib.Config.MODE_STATIC,
                        value: node
                    });
                    node = node.getDomApi(name);
                    if (!node) {
                        return null;
                    }
                }

                var eh = new MetaphorJs.lib.EventHandler(
                    name, scope, node, prepareConfig(config)
                );

                return function(){
                    eh.$destroy();
                    eh = null;
                };
            });

        }(events[i]));
    }

    Directive.registerAttribute("submit", 1000, function(scope, node, config) {

        prepareConfig(config);

        var fn = config.get("value"),
            handler = function(){
                fn(scope);
                config.checkScope("value")
            };

        MetaphorJs.lib.Input.get(node).onKey(13, handler);

        return function() {
            MetaphorJs.lib.Input.get(node).unKey(13, handler);
            handler = null;
            fn = null;
        };
    });

    events = null;

}());
