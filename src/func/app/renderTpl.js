
require("./__init.js");
require("../dom/toFragment.js");
require("../../app/Renderer.js");

var 
MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Render template from string to DomFragment
 * @function MetaphorJs.app.renderTpl
 * @param {string} htmlString
 * @param {MetaphorJs.lib.Scope} scope
 * @returns {DocumentFragment}
 */
module.exports = MetaphorJs.app.renderTpl = function app_renderTpl(htmlString, scope) {

    var div = window.document.createElement("div");

    div.innerHTML = htmlString;

    var fragment = MetaphorJs.dom.toFragment(div.childNodes);

    var renderer = new Renderer(fragment, scope);
    renderer.process();

    return fragment;
};