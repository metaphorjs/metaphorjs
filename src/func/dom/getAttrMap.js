
var parseAttributeName = require("metaphorjs/src/func/dom/parseAttributeName.js");

module.exports = (function(){

return function getAttrMap(node, expand, group) {
    var map,
        i, l, a,
        props, type,
        attrs = node.attributes;

    if (expand && group) {
        map = {
            "modifier": {},
            "directive": {},
            "scope": {},
            "component": {},
            "reference": {}
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
                if (!map[type]) {
                    map[type] = {};
                }
                map[type][props.name] = props;
            }
            else {
                map[props.name] = props;
            }
        }
        else {
            map[a.name] = a.value;
        }
    }

    return map;
};

}());