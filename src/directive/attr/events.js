require("../../lib/EventHandler.js");
require("../../lib/Expression.js");

var Directive = require("../../class/Directive.js"),
    extend = require("../../func/extend.js"),
    Input = require("metaphorjs-input/src/lib/Input.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress',
                  'change',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'load', 'mousewheel',
                  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute(name, 1000,
                function(scope, node, expr, renderer, attr){

                var cfg = attr && attr.config ? extend({}, attr.config) : null,
                    keep = false,
                    k;

                if (cfg) {
                    for (k in cfg) {
                        if (cfg.hasOwnProperty(k)) {
                            keep = true;
                            break;
                        }
                    }
                    if (cfg.preventDefault) {
                        cfg.preventDefault = MetaphorJs.lib.Expression.parse(cfg.preventDefault)(scope);
                    }
                    if (cfg.stopPropagation) {
                        cfg.stopPropagation = MetaphorJs.lib.Expression.parse(cfg.stopPropagation)(scope);
                    }
                    if (cfg.async) {
                        cfg.async = MetaphorJs.lib.Expression.parse(cfg.async)(scope);
                    }
                }

                if (!keep) {
                    cfg = null;
                }

                if (cfg) {
                    cfg.handler = expr;
                    expr = cfg;
                }

                var eh = new MetaphorJs.lib.EventHandler(scope, node, expr, name, {
                    preventDefault: true
                });

                return function(){
                    eh.$destroy();
                    eh = null;
                };
            });

        }(events[i]));
    }

    Directive.registerAttribute("submit", 1000, function(scope, node, expr){

        var fn = MetaphorJs.lib.Expression.parse(expr),
            updateRoot = expr.indexOf('$root') + expr.indexOf('$parent') !== -2,
            handler = function(){
                fn(scope);
                updateRoot ? scope.$root.$check() : scope.$check();
            };

        Input.get(node).onKey(13, handler);

        return function() {
            Input.get(node).unKey(13, handler);
            handler = null;
            fn = null;
        };
    });

    events = null;

}());
