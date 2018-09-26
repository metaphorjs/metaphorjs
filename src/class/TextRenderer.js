

var nextUid = require("../func/nextUid.js"),
    bind = require("../func/bind.js"),
    trim = require("../func/trim.js"),
    undf = require("../var/undf.js"),
    filterLookup = require("../func/filterLookup.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    Observable = require("metaphorjs-observable/src/lib/Observable.js"),
    isNull = require("../func/isNull.js"),
    cls = require("metaphorjs-class/src/cls.js");


module.exports = function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        savedBoundary           = '--##--',

        rReplaceEscape          = /\\{/g,

        observer                = new Observable,

        //parent, userData, recursive
        factory                 = function(scope, origin, opt) {

            if (!origin || !origin.indexOf ||
                (origin.indexOf(startSymbol) === -1 &&
                 origin.indexOf(savedBoundary) === -1)) {

                if (opt.force) {
                    return new TextRenderer(
                        scope,
                        startSymbol + origin + endSymbol,
                        opt
                    );
                }

                return null;
            }

            return new TextRenderer(scope, origin, opt);
        };

    var TextRenderer = cls({

        $class: "MetaphorJs.TextRenderer",

        id: null,
        parent: null,
        isRoot: null,
        scope: null,
        origin: "",
        processed: null,
        text: null,
        watchers: null,
        children: null,
        data: null,
        recursive: false,
        dataChangeDelegate: null,
        changeTmt: null,
        lang: null,
        boundary: null,
        mock: null,

        //parent, userData, recursive, boundary, mock
        $init: function(scope, origin, opt) {

            opt = opt || {};

            var self        = this;

            self.id         = nextUid();
            self.origin     = origin;
            self.scope      = scope;
            self.parent     = opt.parent;
            self.isRoot     = !opt.parent;
            self.data       = opt.userData;
            self.lang       = scope.$app ? scope.$app.lang : null;
            self.boundary   = opt.boundary || "---";
            self.mock       = opt.mock;

            if (opt.recursive === true || opt.recursive === false) {
                self.recursive = opt.recursive;
            }

            self.watchers   = [];
            self.children   = [];

            self.dataChangeDelegate = bind(self.doDataChange, self);
            self.processed  = self.processText(origin, self.mock);
            self.render();
        },

        subscribe: function(fn, context) {
            return observer.on(this.id, fn, context);
        },

        unsubscribe: function(fn, context) {
            return observer.un(this.id, fn, context);
        },

        getString: function() {
            var self = this;

            if (isNull(self.text)) {
                self.render();
            }

            var text = self.text || "";

            if (text.indexOf('\\{') !== -1) {
                return text.replace(rReplaceEscape, '{');
            }

            return text;
        },


        render: function() {

            var self    = this,
                text    = self.processed,
                b       = self.boundary,
                i, l,
                str,
                ch;

            if (!self.children.length) {
                self.createChildren();
            }

            ch = self.children;

            for (i = -1, l = ch.length; ++i < l;) {
                str = ch[i] instanceof TextRenderer ? ch[i].getString() : ch[i];
                text = text.replace(
                    b + i + b,
                    str === null ? "" : str
                );
            }

            self.text = text;

            return text;
        },



        processText: function(text, mock) {

            /*
             arguably, str += "" is faster than separators.push() + separators.join()
             well, at least in my Firefox it is so.
             */

            var self        = this,
                index       = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                result      = "";

            while(index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) !== -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) !== -1) &&
                    text.substr(startIndex - 1, 1) !== '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex !== startIndex + startSymbolLength) {
                        result += self.watcherMatch(
                            text.substring(startIndex + startSymbolLength, endIndex),
                            mock
                        );
                    }

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }


            //saved keys
            /*index       = 0;
            text        = result;
            textLength  = text.length;
            result      = "";
            var bndLen      = savedBoundary.length,
                getterid;

            while(index < textLength) {
                if (((startIndex = text.indexOf(savedBoundary, index)) !== -1) &&
                    (endIndex = text.indexOf(savedBoundary, startIndex + bndLen)) !== -1) {

                    result += text.substring(index, startIndex);

                    getterid    = text.substring(startIndex, endIndex + bndLen);
                    getterid    = getterid.replace(savedBoundary, "");
                    getterid    = parseInt(getterid);

                    result += self.watcherMatch(
                        getterid,
                        mock
                    );

                    index = endIndex + bndLen;
                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }*/

            return result;
        },

        watcherMatch: function(expr, mock) {

            var self        = this,
                ws          = self.watchers,
                b           = self.boundary,
                w,
                isLang      = false,
                recursive   = self.recursive,
                getter      = null;

            expr        = trim(expr);

            if (expr.substr(0,1) === '-') {
                var inx = expr.indexOf(" "),
                    mods = expr.substr(1,inx);
                expr = expr.substr(inx);

                if (!recursive && mods.indexOf("r") !== -1) {
                    recursive = true;
                }
                if (mods.indexOf("l") !== -1) {
                    isLang = true;
                }
            }

            /*if (typeof expr === "number") {
                var getterId = expr;
                if (typeof __MetaphorJsPrebuilt !== "undefined") {
                    expr = __MetaphorJsPrebuilt['__tpl_getter_codes'][getterId];
                    getter = __MetaphorJsPrebuilt['__tpl_getters'][getterId];
                }
                else {
                    return "";
                }
            }*/

            w = createWatchable(
                self.scope,
                expr,
                self.onDataChange,
                self,
                {
                    filterLookup: filterLookup, mock: mock, getterFn: getter,
                    userData: {
                        recursive: recursive
                    }
                }
            );

            if (isLang && !w.hasPipe("l")) {
                w.addPipe("l");
            }

            ws.push(w);

            return b + (ws.length-1) + b;
        },

        onDataChange: function() {

            var self    = this;

            if (!self.changeTmt) {
                self.changeTmt = setTimeout(self.dataChangeDelegate, 0);
            }
        },

        doDataChange: function() {
            var self = this;
            self.destroyChildren();
            self.triggerChange();
            self.changeTmt = null;
        },

        triggerChange: function() {

            var self    = this;
            self.text   = null;

            if (self.isRoot) {
                observer.trigger(self.id, self, self.data);
            }
            else {
                self.parent.triggerChange();
            }
        },


        createChildren: function() {

            var self    = this,
                ws      = self.watchers,
                ch      = self.children,
                scope   = self.scope,
                rec     = false,
                i, l,
                val;

            for (i = -1, l = ws.length; ++i < l; ){
                val     = ws[i].getLastResult();

                //TODO: watcher must have userData!
                // if it doesn't, it was taken from cache and it is wrong
                // because -rl flags may be different
                rec     = self.recursive || (ws[i].userData && ws[i].userData.recursive);
                if (val === undf) {
                    val = "";
                }
                ch.push((rec && factory(scope, val, {parent: self, recursive: true})) || val);
            }
        },

        destroyChildren: function() {

            var self    = this,
                ch      = self.children,
                i, l;

            for (i = -1, l = ch.length; ++i < l; ){
                if (ch[i] instanceof TextRenderer) {
                    ch[i].$destroy();
                }
            }

            self.children = [];
        },

        destroyWatchers: function() {

            var self    = this,
                ws      = self.watchers,
                i, l;

            for (i = -1, l = ws.length; ++i < l;
                 ws[i].unsubscribeAndDestroy(self.onDataChange, self)){}

            self.watchers = [];
        },

        onDestroy: function() {

            var self = this;

            self.destroyChildren();
            self.destroyWatchers();

            observer.destroyEvent(self.id);

            if (self.changeTmt) {
                clearTimeout(self.changeTmt);
            }
        }

    }, {
        create: factory
    });

    return TextRenderer;
}();



