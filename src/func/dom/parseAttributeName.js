
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

    if (name.indexOf("mjs-") === 0) {
        name = name.substr(4);
    }

    var mods, props = {
        type: null,
        mods: null,
        name: name,
        original: name
    };

    if (name === '{@}') {
        props.type = "component-extend";
    }
    else if (name === '{$}') {
        props.type = 'scope-extend';
    }
    else {

        var match = name.match(reg);

        if (match) {
            props.type = types[match[1]];
            props.subtype = subtypes[match[1]];
            name = match[2];
            mods = name.split(".");
            name = mods.shift();
            props.mods = mods.length ? mods : null;
            props.mod_part = mods.join(".");
            //props.directive = type === 'directive' ? name : null;
            //props.name = type === 'directive' ? props.original : name;
            props.name = name;
        }
        else {
            props.type = "attribute";
        }
    }

    return props;
};

}());