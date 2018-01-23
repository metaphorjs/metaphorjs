
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

    var prefixed = false;

    if (name.indexOf("mjs-") === 0) {
        name = name.substr(4);
        prefixed = true;
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
        }
        else {
            props.type = prefixed ? "directive" : "attribute";
        }

        if (props.type !== "attribute") {
            mods = name.split(".");
            name = mods.shift();
            props.mods = mods.length ? mods : null;
            props.mod_part = mods.join(".");
            props.name = name;
        }
    }

    return props;
};

}());