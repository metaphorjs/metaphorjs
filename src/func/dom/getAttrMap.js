
var parseAttributeName = require("metaphorjs/src/func/dom/parseAttributeName.js");

module.exports = (function(){

var extendWithAttributes = function(target, attrMap, type) {

    var name,
        prev,
        data = {};

    if (attrMap[type+"-extend"]) {
        extend(
            data,
            createGetter(attrMap[type+"-extend"])(target),
            true,
            false
        );
    }

    for (name in attrMap[type]) {
        data[name] = attrMap[type][name].value;
    }

    for (name in data) {
        prev = target[name];
        if (prev === undefined || prev === null || prev === "") {
            target[name] = data[name];
        }
    }

    return target;
};

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
            "component-extend": null,
            "scope-extend": null,
            "attribute": {},

            "_modifier": 0,
            "_directive": 0,
            "_scope": 0,
            "_component": 0,
            "_reference": 0,
            "_attribute": 0,

            "extendTarget": function(type, target) {
                return extendWithAttributes(target || {}, this, type);
            }
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

            if (props.type === "component-extend" || props.type === "scope-extend") {
                map[props.type] = a.value;
            }
            else {

                if (group) {
                    type = props.type || "";
                    m = map[type];
                    map["_"+type]++;
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
        }
        else {
            map[a.name] = a.value;
        }
    }

    console.log(node, map);

    return map;
};

}());