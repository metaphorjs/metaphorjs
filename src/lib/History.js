
require("metaphorjs-observable/src/lib/Observable.js");
require("metaphorjs/src/func/dom/getAttr.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/normalizeEvent.js");
require("metaphorjs-shared/src/func/browser/parseLocation.js");
require("metaphorjs-shared/src/func/browser/joinLocation.js");

var extend = require("metaphorjs-shared/src/func/extend.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


module.exports = MetaphorJs.lib.History = function() {

    var win,
        history,
        location,
        observable      = new MetaphorJs.lib.Observable,
        api             = {},
        programId       = nextUid(),
        stateKeyId      = "$$" + programId,
        currentId       = nextUid(),

        hashIdReg       = new RegExp("#" + programId + "=([A-Z0-9]+)"),

        pushState,
        replaceState,

        windowLoaded    = typeof window == "undefined",

        prevLocation    = null,

        pushStateSupported,
        hashChangeSupported,
        useHash;


    observable.createEvent("before-location-change", false);
    observable.createEvent("void-click", false);

    var initWindow = function() {
        win                 = window;
        history             = win.history;
        location            = win.location;
        pushStateSupported  = !!history.pushState;
        hashChangeSupported = "onhashchange" in win;
        useHash             = false; //pushStateSupported && (navigator.vendor || "").match(/Opera/);
        prevLocation        = extend({}, location, true, false);
    };

    var preparePushState = function(state) {
        state = state || {};
        if (!state[stateKeyId]) {
            state[stateKeyId] = nextUid();
        }
        currentId = state[stateKeyId];

        return state;
    };

    var prepareReplaceState = function(state) {
        state = state || {};
        if (!state[stateKeyId]) {
            state[stateKeyId] = currentId;
        }
        return state;
    };


    var hostsDiffer = function(prev, next) {

        if (typeof prev == "string") {
            prev = MetaphorJs.browser.parseLocation(prev);
        }
        if (typeof next == "string") {
            next = MetaphorJs.browser.parseLocation(next);
        }

        var canBeEmpty = ["protocol", "host", "port"],
            i, l,
            k;

        for (i = 0, l = canBeEmpty.length; i < l; i++) {
            k = canBeEmpty[i];
            if (prev[k] && next[k] && prev[k] != next[k]) {
                return true;
            }
        }

        return false;
    };

    var pathsDiffer = function(prev, next) {

        if (typeof prev == "string") {
            prev = MetaphorJs.browser.parseLocation(prev);
        }
        if (typeof next == "string") {
            next = MetaphorJs.browser.parseLocation(next);
        }

        return hostsDiffer(prev, next) || prev.pathname != next.pathname ||
            prev.search != next.search || prev.hash != next.hash;
    };









    var preparePath = function(url) {

        var loc = MetaphorJs.browser.parseLocation(url);

        if (!pushStateSupported || useHash) {
            return loc.path;
        }

        return MetaphorJs.browser.joinLocation(loc, {onlyPath: true});
    };






    var getCurrentStateId = function() {


        if (pushStateSupported) {
            return history.state ? history.state[stateKeyId] : null;
        }
        else {
            return parseOutHashStateId(location.hash).id;
        }

    };

    var parseOutHashStateId = function(hash) {

        var id = null;

        hash = hash.replace(hashIdReg, function(match, idMatch){
            id = idMatch;
            return "";
        });

        return {
            hash: hash,
            id: id
        };
    };

    var setHash = function(hash, state) {

        if (hash) {
            if (hash.substr(0,1) != '#') {
                hash = parseOutHashStateId(hash).hash;
                hash = "!" + hash + "#" + programId + "=" + currentId;
            }
            location.hash = hash;
        }
        else {
            location.hash = "";
        }
    };

    var getCurrentUrl = function() {
        var loc,
            tmp;

        if (pushStateSupported) {
            //loc = location.pathname + location.search + location.hash;
            loc = MetaphorJs.browser.joinLocation(location);
        }
        else {
            loc = location.hash.substr(1);
            tmp = extend({}, location, true, false);

            if (loc) {

                loc = parseOutHashStateId(loc).hash;

                if (loc.substr(0, 1) == "!") {
                    loc = loc.substr(1);
                }
                var p = decodeURIComponent(loc).split("?");
                tmp.pathname = p[0];
                tmp.search = p[1] ? "?" + p[1] : "";
            }

            loc = MetaphorJs.browser.joinLocation(tmp);
        }

        return loc;
    };


    var onLocationPush = function(url) {
        prevLocation = extend({}, location, true, false);
        triggerEvent("location-change", url);
    };

    var onLocationPop = function() {
        if (pathsDiffer(prevLocation, location)) {

            var url     = getCurrentUrl(),
                state   = history.state || {};

            triggerEvent("before-location-pop", url);

            currentId       = getCurrentStateId();
            prevLocation    = extend({}, location, true, false);

            triggerEvent("location-change", url);
        }
    };

    var triggerEvent = function triggerEvent(event, data, anchor) {
        var url     = data || getCurrentUrl(),
            loc     = MetaphorJs.browser.parseLocation(url),
            path    = loc.pathname + loc.search + loc.hash;
        return observable.trigger(event, path, anchor, url);
    };

    var init = function() {

        initWindow();

        // normal pushState
        if (pushStateSupported) {

            //history.origPushState       = history.pushState;
            //history.origReplaceState    = history.replaceState;

            MetaphorJs.dom.addListener(win, "popstate", onLocationPop);

            pushState = function(url, anchor, state) {
                if (triggerEvent("before-location-change", url, anchor) === false) {
                    return false;
                }
                history.pushState(preparePushState(state), null, preparePath(url));
                onLocationPush(url);
            };


            replaceState = function(url, anchor, state) {
                history.replaceState(prepareReplaceState(state), null, preparePath(url));
                onLocationPush(url);
            };

            async(function(){
                replaceState(getCurrentUrl());
            });
        }
        else {

            // onhashchange
            if (hashChangeSupported) {

                pushState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
                        return false;
                    }
                    async(setHash, null, [preparePath(url), preparePushState(state)]);
                };

                replaceState = function(url, anchor, state) {
                    async(setHash, null, [preparePath(url), prepareReplaceState(state)]);
                };

                MetaphorJs.dom.addListener(win, "hashchange", onLocationPop);
            }
            // iframe
            else {

                var frame   = null,
                    initialUpdate = false;

                var createFrame = function() {
                    frame   = window.document.createElement("iframe");
                    frame.src = 'about:blank';
                    frame.style.display = 'none';
                    window.document.body.appendChild(frame);
                };

                win.onIframeHistoryChange = function(val) {
                    if (!initialUpdate) {
                        async(function(){
                            setHash(val);
                            onLocationPop();
                        });
                    }
                };

                var pushFrame = function(value) {
                    var frameDoc;
                    if (frame.contentDocument) {
                        frameDoc = frame.contentDocument;
                    }
                    else {
                        frameDoc = frame.contentWindow.document;
                    }
                    frameDoc.open();
                    //update iframe content to force new history record.
                    frameDoc.write('<html><head><title>' + document.title +
                                   '</title><script type="text/javascript">' +
                                   'var hashValue = "'+value+'";'+
                                   'window.top.onIframeHistoryChange(hashValue);' +
                                   '</script>' +
                                   '</head><body>&nbsp;</body></html>'
                    );
                    frameDoc.close();
                };

                var replaceFrame = function(value) {
                    frame.contentWindow.hashValue = value;
                };


                pushState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
                        return false;
                    }
                    pushFrame(preparePath(url));
                };

                replaceState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
                        return false;
                    }
                    replaceFrame(preparePath(url));
                };

                var initFrame = function(){
                    createFrame();
                    initialUpdate = true;
                    pushFrame(preparePath(location.hash.substr(1)));
                    initialUpdate = false;
                };

                if (windowLoaded) {
                    initFrame();
                }
                else {
                    MetaphorJs.dom.addListener(win, "load", initFrame);
                }
            }
        }

        MetaphorJs.dom.addListener(window.document.documentElement, "click", function(e) {

            e = MetaphorJs.dom.normalizeEvent(e || win.event);

            var a = e.target,
                href;

            while (a && a.nodeName.toLowerCase() != "a") {
                a = a.parentNode;
            }

            if (a && !e.isDefaultPrevented()) {

                href = MetaphorJs.dom.getAttr(a, "href");

                if (href == "#") {

                    var res = observable.trigger("void-click", a);

                    if (!res) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }

                if (href && href.substr(0,1) != "#" && !MetaphorJs.dom.getAttr(a, "target")) {

                    var prev = extend({}, location, true, false),
                        next = MetaphorJs.browser.parseLocation(href);

                    if (hostsDiffer(prev, next)) {
                        return null;
                    }

                    if (pathsDiffer(prev, next)) {
                        pushState(href, a);
                    }
                    else {
                        triggerEvent("same-location", null, a);
                    }

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            return null;
        });

        init = emptyFn;
    };


    MetaphorJs.dom.addListener(window, "load", function() {
        windowLoaded = true;
    });


    /**
     * Browser pushState wrapper and polyfill. 
     * @object MetaphorJs.lib.History
     */
    return extend(api, {

        /**
         * @property {function} on {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * @param {object} options
         * }
         */
        on: function() {
            return observable.on.apply(observable, arguments);
        },

        /**
         * @property {function} un {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * }
         */
        un: function() {
            return observable.un.apply(observable, arguments);
        },

        /**
         * @property {function} once {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * }
         */
        once: function() {
            return observable.once.apply(observable, arguments);
        },

        /**
         * @property {function} push {
         *  Push new url
         *  @param {string} url
         *  @param {object} state
         * }
         */
        push: function(url, state) {
            init();

            var prev = extend({}, location, true, false),
                next = MetaphorJs.browser.parseLocation(url);

            if (hostsDiffer(prev, next)) {
                return null;
            }

            if (pathsDiffer(prev, next)) {
                pushState(url, null, state);
            }
        },

        /**
         * @property {function} replace {
         *  Replace current url with another url
         *  @param {string} url
         *  @param {object} state
         * }
         */
        replace: function(url, state) {
            init();
            var prev = extend({}, location, true, false),
                next = MetaphorJs.browser.parseLocation(url);

            if (hostsDiffer(prev, next)) {
                return null;
            }

            if (pathsDiffer(prev, next)) {
                replaceState(url, null, state);
            }
        },

        /**
         * Update state of current url
         * @property {function} saveState {
         *  @param {object} state
         * }
         */
        saveState: function(state) {
            init();
            replaceState(getCurrentUrl(), null, state);
        },

        /**
         * Merge new state into current state 
         * @property {function} mergeState {
         *  @param {object} state
         * }
         */
        mergeState: function(state) {
            this.saveState(extend({}, history.state, state, true, false));
        },

        /**
         * Get current state
         * @property {function} getState {
         *  @returns {object}
         * }
         */
        getState: function() {
            return history.state;
        },

        /**
         * Get current instance id
         * @property {functrion} getCurrentStateId {
         *  @returns {string}
         * }
         */
        getCurrentStateId: function() {
            return currentId;
        },

        /**
         * Get current url
         * @property {function} current {
         *  @returns {string} url
         * }
         */
        current: function() {
            init();
            return getCurrentUrl();
        },

        /**
         * Initialize instance 
         * @property {function} init
         */
        init: function() {
            return init();
        },

        /**
         * Polyfill window.pushState and replaceState
         * @property {function} polyfill
         */
        polyfill: function() {
            init();
            window.history.pushState = function(state, title, url) {
                pushState(url, null, state);
            };
            window.history.replaceState = function(state, title, url) {
                replaceState(url, null, state);
            };
        }
    });

}();
