
require("./__init.js");
require("../dom/toFragment.js");
require("../../app/Renderer.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Render template from string to DomFragment
 * @function MetaphorJs.app.renderTpl
 * @param {string} htmlString
 * @param {MetaphorJs.lib.State} state
 * @returns {DocumentFragment}
 */
module.exports = MetaphorJs.app.renderTpl = function app_renderTpl(htmlString, state) {

    var div = window.document.createElement("div");

    div.innerHTML = htmlString;

    var fragment = MetaphorJs.dom.toFragment(div.childNodes);

    var renderer = new MetaphorJs.app.Renderer;
    state.$on("destroy", renderer.$destroy, renderer);
    renderer.process(fragment, state);

    return fragment;
};