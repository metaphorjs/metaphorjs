require("../../lib/EventHandler.js");
require("../../lib/Expression.js");
require("../../lib/Input.js");

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
        config.setProperty("preventDefault", {type: "bool", defaultValue: true});
        config.setProperty("stopPropagation", {type: "bool"});
        config.setProperty("if", {type: "bool"});
        config.eachProperty(function(k){
            if (k === 'value' || k.indexOf('value.') === 0) {
                config.setProperty(k, {
                    mode: MetaphorJs.lib.Config.MODE_GETTER
                });
            }
        });
        config.lateInit();
        return config;
    };

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute(name, 1000,
                function(scope, node, config, renderer, attrSet) {

                var eh = new MetaphorJs.lib.EventHandler(
                    scope, node, prepareConfig(config), name
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
            expr = config.getProperty("value").expression,
            updateRoot = expr.indexOf('$root') + expr.indexOf('$parent') !== -2,
            handler = function(){
                fn(scope);
                updateRoot ? scope.$root.$check() : scope.$check();
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
