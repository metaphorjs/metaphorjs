
var Directive = require("../../class/Directive.js"),
    EventHandler = require("../../lib/EventHandler.js"),
    createFunc = require("metaphorjs-watchable/src/func/createFunc.js"),
    Input = require("metaphorjs-input/src/lib/Input.js");

(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'load', 'mousewheel',
                  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute(name, 1000, function(scope, node, expr){

                var eh = new EventHandler(scope, node, expr, name, {
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

        var fn = createFunc(expr),
            updateRoot = expr.indexOf('$root') + expr.indexOf('$parent') != -2,
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
