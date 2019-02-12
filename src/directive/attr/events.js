require("../../lib/EventHandler.js");
require("../../lib/Expression.js");
require("../../lib/Input.js");
require("../../lib/Config.js");
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");

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
        var ms = MetaphorJs.lib.Config.MODE_STATIC;
        config.setProperty("preventDefault", {
            type: "bool", 
            defaultValue: true,
            defaultMode: ms
        });
        config.setType("stopPropagation", "bool", ms);
        config.setType("if", "bool");
        config.setType("not", "string", ms);
        config.eachProperty(function(k){
            if (k === 'value' || k.indexOf('value.') === 0) {
                config.setMode(k, MetaphorJs.lib.Config.MODE_FUNC);
            }
        });
        return config;
    };

    var createHandler = function(name, scope, node, config) {
        return new MetaphorJs.lib.EventHandler(
            name, scope, node, prepareConfig(config)
        );
    };

    var getNode = function(node, config, directive, cb) {
        Directive.resolveNode(node, directive, function(node, cmp){
            if(cmp) {
                config.setProperty("targetComponent", {
                    mode: MetaphorJs.lib.Config.MODE_STATIC,
                    value: cmp
                });
            }
            cb(node);
        });
    };

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute(name, 1000,
                function(scope, node, config, renderer, attrSet) {

                var eh,
                    destroyed = false,
                    init = function(node) {
                        if (!destroyed) {
                            eh = createHandler(name, scope, node, config);
                        }
                    };

                if (window.document.readyState === "complete") {
                    getNode(node, config, name, init);
                }
                MetaphorJs.dom.addListener(window, "load", function(){
                    getNode(node, config, name, init);
                });

                return function() {
                    destroyed = true;
                    if (eh) {
                        eh.$destroy();
                        eh = null;
                    }
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
            },
            resolvedNode,
            init = function(node) {
                if (handler) {
                    resolvedNode = node;
                    MetaphorJs.lib.Input.get(node).onKey(13, handler);
                }
            };

        if (window.document.readyState === "complete") {
            getNode(node, config, "submit", init);
        }
        MetaphorJs.dom.addListener(window, "load", function(){
            getNode(node, config, "submit", init);
        });

        return function() {
            if (resolvedNode) {
                MetaphorJs.lib.Input.get(resolvedNode).unKey(13, handler);
            }
            handler = null;
            fn = null;
        };
    });

    events = null;

}());
