//#require ../array/toArray.js
//#require ../array/inArray.js
//#require ../array/isArray.js
//#require getValue.js

/**
 * @param {Element} el
 * @param {*} val
 */
var setValue = MetaphorJs.setValue = function() {

    var hooks = {
        select:  function(elem, value) {

            var optionSet, option,
                options     = elem.options,
                values      = toArray(value),
                i           = options.length,
                setIndex    = -1;

            while ( i-- ) {
                option = options[i];

                if ((option.selected = inArray(option.value, values))) {
                    optionSet = true;
                }
                else if (option.getAttribute("mjs-default-option") !== null) {
                    setIndex = i;
                }
            }

            // Force browsers to behave consistently when non-matching value is set
            if ( !optionSet ) {

                elem.selectedIndex = setIndex;
            }
            return values;
        }
    };

    hooks["radio"] = hooks["checkbox"] = function(elem, value) {
        if (isArray(value) ) {
            return (elem.checked = inArray(getValue(elem), value));
        }
    };


    return function(el, val) {

        if (el.nodeType !== 1) {
            return;
        }

        // Treat null/undefined as ""; convert numbers to string
        if (val === null) {
            val = "";
        }
        else if (typeof val === "number") {
            val += "";
        }

        var hook = hooks[el.type] || hooks[el.nodeName.toLowerCase()];

        // If set returns undefined, fall back to normal setting
        if (!hook || hook(el, val, "value") === undefined ) {
            el.value = val;
        }
    };
}();