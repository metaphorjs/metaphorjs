
module.exports = function restoreAttributeName(name, props) {

    var full = name;

    if (props.mods) {
        full += "." + props.mods.join(".");
    }
    switch (props.type) {
        case "cmp-extend":
            return "{@}";
        case "scope-extend":
            return "{$}";
        case "cmp-property":
            return "@" + full;
        case "scope-property":
            return "$" + full;
        case "node-property":
            return "*" + full;
        case "directive":
            return "[" + full + "]";
        case "event":
            return "(" + full + ")";
        case "node-reference":
            return "#" + full;
    }

    return full;
};
