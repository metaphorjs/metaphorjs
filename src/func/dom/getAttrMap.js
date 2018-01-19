
var parseAttributeName = require("metaphorjs/src/func/dom/parseAttributeName.js");

module.exports = (function(){

return function getAttrMap(node, expand, group) {
    var map,
        i, l, a, m,
        props, type,
        attrs = node.attributes;

    if (expand && group) {
        map = {
            "modifier": {},
            "directive": {},
            "scope": {},
            "component": {},
            "reference": {},
            "component-extend": {},
            "scope-extend": {},
            "attribute": {}
        };
    }
    else {
        map = {};
    }

    for (i = 0, l = attrs.length; i < l; i++) {
        a = attrs[i];

        if (expand) {
            props = parseAttributeName(a.name);
            props.original = a.name;

            if (group) {
                type = props.type || "";
                m = map[type];
            }
            else {
                m = map;
            }

            if (!m[props.name]) {
                if (props.mod_part) {
                    props.value = {};
                    props.value[props.mod_part] = a.value;
                }
                else {
                    props.value = a.value;
                }
                m[props.name] = props;
            }
            else {
                m[props.name].value[props.mod_part] = a.value;
            }
        }
        else {
            map[a.name] = a.value;
        }
    }

    return map;
};

}());