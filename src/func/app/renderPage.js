
require("./__init.js");
require("../dom/toFragment.js");
require("./init.js");
require("metaphorjs-promise/src/lib/Promise.js");

const nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Render page from html 
 * @function MetaphorJs.app.renderPage
 * @param {object|string} opt {
 *  String as html
 *  @type {string} html
 *  @type {string} appClass App class name (not css)
 *  @type {object} appData
 *  @type {Document} document Empty document
 * }
 * @param {Document} document Empty document
 * @returns {string} rendered html
 */
module.exports = MetaphorJs.app.renderPage = function app_renderPage(opt, doc) {

    if (typeof opt === "string") {
        opt = {
            html: opt
        };
    }

    if (!opt.html) {
        return MetaphorJs.lib.Promise.resolve("");
    }

    let document = doc || opt.document;
    let jsdom;
    
    if (!document) {
        jsdom = require("jsdom");
        document = jsdom.jsdom('');
    }

    const id = nextUid(),
        frag = MetaphorJs.dom.toFragment(opt.html, document),
        p = new MetaphorJs.lib.Promise,
        start = "<" + id,
        end = id + ">",
        startCmt = document.createComment(start),
        endCmt = document.createComment(end);

    frag.insertBefore(startCmt, frag.firstChild);
    frag.appendChild(endCmt);
    document.appendChild(frag);

    MetaphorJs.app.init(document.documentElement, opt.appClass, opt.appData, true)
        .done(function(){
            const html = jsdom ? jsdom.serializeDocument(document) : 
                                document.documentElement.innerHTML,
                    inx1 = html.indexOf(start),
                    inx2 = html.indexOf(end);

            p.resolve(html.substring(inx1 + start.length, inx2));
        });

    return p;
};