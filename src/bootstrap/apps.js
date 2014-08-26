//#require ../func/initApp.js
//#require ../func/dom/onReady.js

onReady(function() {

    var appNodes    = select("[mjs-app]"),
        i, l, el,
        done        = function(app) {
            app.run();
        };

    for (i = -1, l = appNodes.length; ++i < l;){
        el      = appNodes[i];
        initApp(el, el.getAttribute && el.getAttribute("mjs-app")).done(done);
    }
});