
var Directive = require("../../class/Directive.js"),
    createFunc = require("../../../../metaphorjs-watchable/src/func/createFunc.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js"),
    handleDomEvent = require("../../func/event/handleDomEvent.js");

(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress', 'submit',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'mousewheel',
                  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute("mjs-" + name, 1000, function(scope, node, expr){

                var cfg = {};

                if (expr.substr(0,1) == '{') {
                    cfg = createGetter(expr)(scope);
                }
                else {
                    cfg.handler = createFunc(expr);
                }

                cfg.event = name;

                handleDomEvent(node, scope, cfg);
            });



        }(events[i]));
    }

}());
