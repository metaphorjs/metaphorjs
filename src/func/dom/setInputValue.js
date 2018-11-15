
require("./__init.js");
require("./getInputValue.js");
require("metaphorjs/src/func/dom/getAttr.js");
require("metaphorjs/src/func/dom/setAttr.js");
require("metaphorjs/src/func/dom/removeAttr.js");

var toArray     = require("metaphorjs-shared/src/func/toArray.js"),
    isArray     = require("metaphorjs-shared/src/func/isArray.js"),
    isNumber    = require("metaphorjs-shared/src/func/isNumber.js"),
    undf        = require("metaphorjs-shared/src/var/undf.js"),
    isNull      = require("metaphorjs-shared/src/func/isNull.js"),
    MetaphorJs  = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @function MetaphorJs.dom.setInputValue
 * @param {Element} el
 * @param {*} val
 */
module.exports = MetaphorJs.dom.setInputValue = function() {

    var hooks = {
        select:  function(elem, value) {

            var optionSet, option,
                options     = elem.options,
                values      = toArray(value),
                i           = options.length,
                selected,
                setIndex    = -1;

            while ( i-- ) {
                option      = options[i];
                selected    = values.indexOf(option.value) !== -1;

                if (selected) {
                    MetaphorJs.dom.setAttr(option, "selected", "selected");
                    option.selected = true;
                    optionSet = true;
                }
                else {
                    MetaphorJs.dom.removeAttr(option, "selected");
                }

                if (!selected && !isNull(MetaphorJs.dom.getAttr(option, "default-option"))) {
                    setIndex = i;
                }
            }

            // Force browsers to behave consistently when non-matching value is set
            if (!optionSet) {
                elem.selectedIndex = setIndex;
            }

            return values;
        }
    };

    hooks["radio"] = hooks["checkbox"] = function(elem, value) {
        if (isArray(value) ) {
            return (elem.checked = value.indexOf(
                MetaphorJs.dom.getInputValue(elem)
                ) !== -1);
        }
    };


    return function(el, val) {

        if (el.nodeType !== 1) {
            return;
        }

        // Treat null/undefined as ""; convert numbers to string
        if (isNull(val)) {
            val = "";
        }
        else if (isNumber(val)) {
            val += "";
        }

        var hook = hooks[el.type] || hooks[el.nodeName.toLowerCase()];

        // If set returns undefined, fall back to normal setting
        if (!hook || hook(el, val, "value") === undf) {
            el.value = val;
        }
    };
}();