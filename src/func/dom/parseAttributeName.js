
module.exports = (function(){

var reg = /^([\[({@#$*])([^)\]}"']+)[\])}]?$/,
    types = {
        "*": "modifier",
        "$": "scope",
        "@": "component",
        "#": "reference",

        "[": "directive",
        "(": "directive",
        "{": "directive"
    },
    subtypes = {
        "[": "property",
        "(": "event"
    };

return function parseAttributeName(name) {

    var mods, type, props = {
        type: null,
        mods: null,
        name: name,
        original: name
    };

    if (name === '{@}') {
        props.type = "cmp-extend";
    }
    else if (name === '{$}') {
        props.type = 'scope-extend';
    }
    else {

        var match = name.match(reg);

        if (match) {
            props.type = type = types[match[1]];
            props.subtype = subtypes[match[1]];
            name = match[2];
            mods = name.split(".");
            name = name.unshift();
            props.mods = mods.length ? mods : null;
            props.directive = type === 'directive' ? name : null;
            props.name = type === 'directive' ? props.original : name;
        }
    }

    return props;
};

}());