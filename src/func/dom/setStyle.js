

module.exports = function setStyle(el, name, value) {

    if (!el || !el.style) {
        return;
    }

    var props,
        style = el.style,
        k;

    if (typeof name == "string") {
        props = {};
        props[name] = value;
    }
    else {
        props = name;
    }

    for (k in props) {
        style[k] = props[k];
    }
};