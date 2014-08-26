//#require nsAdd.js
//#require nsGet.js

var registerAttributeHandler,
    getAttributeHandlers,
    registerTagHandler,
    getTagHandlers;


(function(){

    var attributeHandlers   = [],
        tagHandlers         = [],
        attributesSorted    = false,
        tagsSorted          = false,

        compare             = function(a, b) {
            //if (a is less than b by some ordering criterion)
            if (a.priority < b.priority) {
                return -1;
            }

            //if (a is greater than b by the ordering criterion)
            if (a.priority > b.priority) {
                return 1;
            }

            // a must be equal to b
            return 0;
        };

    MetaphorJs.registerAttributeHandler = registerAttributeHandler = function(name, priority, handler) {
        if (!nsGet("attr." + name, true)) {
            attributeHandlers.push({
                priority: priority,
                name: name,
                handler: nsAdd("attr." + name, handler)
            });
            attributesSorted = false;
        }
    };

    MetaphorJs.getAttributeHandlers = getAttributeHandlers = function() {
        if (!attributesSorted) {
            attributeHandlers.sort(compare);
            attributesSorted = true;
        }
        return attributeHandlers;
    };

    MetaphorJs.registerTagHandler = registerTagHandler = function(name, priority, handler) {
        if (!nsGet("tag." + name, true)) {
            tagHandlers.push({
                priority: priority,
                name: name,
                handler: nsAdd("tag." + name, handler)
            });
            tagsSorted = false;
        }
    };

    MetaphorJs.getTagHandlers = getTagHandlers = function() {
        if (!tagsSorted) {
            tagHandlers.sort(compare);
            tagsSorted = true;
        }
        return tagHandlers;
    };

}());