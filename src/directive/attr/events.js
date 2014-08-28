
var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    createFunc = require("../../../../metaphorjs-watchable/src/func/createFunc.js"),
    normalizeEvent = require("../../func/event/normalizeEvent.js"),
    Scope = require("../../lib/Scope.js");

(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'mouseenter',
                  'mouseleave', 'keydown', 'keyup', 'keypress', 'submit',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'enter'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            var eventName = name;

            if (eventName == "enter") {
                eventName = "keyup";
            }

            registerAttributeHandler("mjs-" + name, 1000, function(scope, node, expr){

                var fn  = createFunc(expr);

                addListener(node, eventName, function(e){

                    e = e || window.event;
                    e = normalizeEvent(e);

                    if (name == "enter" && e.keyCode != 13) {
                        return null;
                    }

                    scope.$event = e;

                    try {
                        fn(scope);
                    }
                    catch (thrownError) {
                        error(thrownError);
                    }

                    delete scope.$event;

                    if (scope instanceof Scope) {
                        scope.$root.$check();
                    }
                    else if (scope.$$watchers) {
                        scope.$$watchers.$checkAll();
                    }

                    e.preventDefault();
                    return false;
                });
            });
        }(events[i]));
    }

}());
