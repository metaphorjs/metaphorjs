
module.exports = (function(){

var reg = /^([\[({@#$*])([^)\]}"']+)[\])}]?$/,
    types = {
        "*": "node-property",
        "$": "scope-property",
        "@": "cmp-property",
        "[": "directive",
        "(": "event",
        "#": "node-reference"
    };

return function parseAttributeName(name) {

    var mods, props = {
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
            props.type = types[match[1]];
            name = match[2];
            mods = name.split(".");
            name = name.unshift();
            props.mods = mods.length ? mods : null;
            props.name = name;
        }
    }

    return props;
};

}());