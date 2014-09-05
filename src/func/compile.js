
var Renderer = require("../view/Renderer.js"),
    toFragment = require("./dom/toFragment.js");

module.exports = function(htmlString, scope) {

    var div = document.createElement("div");

    div.innerHTML = htmlString;

    var fragment = toFragment(div.childNodes);

    var renderer = new Renderer(fragment, scope);
    renderer.process();

    return fragment;
};