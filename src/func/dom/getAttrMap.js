
var parseAttributeName = require("metaphorjs/src/func/dom/parseAttributeName.js");

module.exports = (function(){

return function getAttrMap(node, expand) {
    var map = {},
        i, l, a,
        props,
        attrs = node.attributes;

    for (i = 0, l = attrs.length; i < l; i++) {
        a = attrs[i];

        if (expand) {
            props = parseAttributeName(a.name);
            props.original = a.name;
            map[props.name] = props;
        }
        else {
            map[a.name] = a.value;
        }
    }

    return map;
};

}());