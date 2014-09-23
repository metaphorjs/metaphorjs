
var Renderer = require("../class/Renderer.js"),
    toFragment = require("./dom/toFragment.js");

module.exports = function compile(htmlString, scope) {

    var div = document.createElement("div");

    div.innerHTML = htmlString;

    var fragment = toFragment(div.childNodes);

    var renderer = new Renderer(fragment, scope);
    renderer.process();

    return fragment;
};