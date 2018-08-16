
var jsdom = require("jsdom"),
    toFragment = require("./dom/toFragment.js"),
    initApp = require("./initApp.js"),
    nextUid = require("./nextUid.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js");

module.exports = function(opt, doc) {

    if (typeof opt === "string") {
        opt = {
            html: opt
        };
    }

    if (!opt.html) {
        return Promise.resolve("");
    }

    var document = doc || opt.document || jsdom.jsdom(''),
        id = nextUid(),
        frag = toFragment(opt.html, document),
        p = new Promise,
        start = "<" + id,
        end = id + ">",
        startCmt = document.createComment(start),
        endCmt = document.createComment(end);

    frag.insertBefore(startCmt, frag.firstChild);
    frag.appendChild(endCmt);
    document.appendChild(frag);

    initApp(document.documentElement, opt.appClass, opt.appData, true)
        .done(function(){
            var html = jsdom.serializeDocument(document),
                inx1 = html.indexOf(start),
                inx2 = html.indexOf(end);
            
            p.resolve(html.substring(inx1 + start.length, inx2));
        });

    return p;
};