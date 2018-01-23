

var nextUid = require("../func/nextUid.js"),
    bind = require("../func/bind.js"),
    trim = require("../func/trim.js"),
    undf = require("../var/undf.js"),
    split = require("../func/split.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    Observable = require("metaphorjs-observable/src/lib/Observable.js"),
    isNull = require("../func/isNull.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    defineClass = require("metaphorjs-class/src/func/defineClass.js");


module.exports = function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        savedBoundary           = '--##--',

        langStartSymbol         = '{[',
        langEndSymbol           = ']}',
        langStartLength         = 2,
        langEndLength           = 2,

        rReplaceEscape          = /\\{/g,

        observer                = new Observable,

        factory                 = function(scope, origin, parent, userData, recursive) {

            if (!origin || !origin.indexOf ||
                (origin.indexOf(startSymbol) === -1 &&
                 origin.indexOf(langStartSymbol) === -1 &&
                 origin.indexOf(savedBoundary) === -1)) {
                return null;
            }

            return new TextRenderer(scope, origin, parent, userData, recursive);
        };

    var TextRenderer = defineClass({

        $class: "TextRenderer",

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

        $init: function(scope, origin, parent, userData, recursive, boundary, mock) {

            var self        = this;

            self.id         = nextUid();
            self.origin     = origin;
            self.scope      = scope;
            self.parent     = parent;
            self.isRoot     = !parent;
            self.data       = userData;
            self.lang       = scope.$app ? scope.$app.lang : null;
            self.boundary   = boundary || "---";
            self.mock       = mock;

            if (recursive === true || recursive === false) {
                self.recursive = recursive;
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

            var text = self.text;

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
                ch;

            if (!self.children.length) {
                self.createChildren();
            }

            ch = self.children;

            for (i = -1, l = ch.length; ++i < l;
                 text = text.replace(
                     b + i + b,
                     ch[i] instanceof TextRenderer ? ch[i].getString() : ch[i]
                 )) {}

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
            //separators  = [];

            // regular keys
            while(index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) !== -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) !== -1) &&
                    text.substr(startIndex - 1, 1) !== '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex !== startIndex + startSymbolLength) {
                        result += self.watcherMatch(
                            text.substring(startIndex + startSymbolLength, endIndex),
                            false,
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

            index       = 0;
            text        = result;
            textLength  = text.length;
            result      = "";
            //separators  = [];

            // lang keys
            while(index < textLength) {

                if (((startIndex = text.indexOf(langStartSymbol, index)) !== -1) &&
                    ((endIndex = text.indexOf(langEndSymbol, startIndex + langStartLength)) !== -1) &&
                    text.substr(startIndex - 1, 1) !== '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex !== startIndex + langStartLength) {
                        result += self.watcherMatch(
                            text.substring(startIndex + langStartLength, endIndex),
                            true,
                            mock
                        );
                    }

                    index = endIndex + langEndLength;

                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }

            //saved keys
            index       = 0;
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
                        false,
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
            }

            return result;
        },

        watcherMatch: function(expr, isLang, mock) {

            var self    = this,
                ws      = self.watchers,
                b       = self.boundary,
                getter  = null;

            if (typeof expr === "number") {
                var getterId = expr;
                if (typeof __MetaphorJsPrebuilt !== "undefined") {
                    expr = __MetaphorJsPrebuilt['__tpl_getter_codes'][getterId];
                    getter = __MetaphorJsPrebuilt['__tpl_getters'][getterId];
                }
                else {
                    return "";
                }
            }

            if (isLang) {
                expr        = trim(expr);
                var tmp     = split(expr, "|"),
                    key     = trim(tmp[0]);
                if (key.substr(0, 1) !== ".") {
                    tmp[0]  = "'" + key + "'";
                }
                if (tmp.length === 1) {
                    tmp.push("l");
                }
                expr        = tmp.join(" | ");
            }
            
            ws.push(createWatchable(
                self.scope,
                expr,
                self.onDataChange,
                self,
                {namespace: ns, mock: mock, getterFn: getter}
            ));

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
                rec     = self.recursive,
                i, l,
                val;

            for (i = -1, l = ws.length; ++i < l; ){
                val     = ws[i].getLastResult();
                if (val === undf) {
                    val = "";
                }
                ch.push((rec && factory(scope, val, self, null, true)) || val);
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

        destroy: function() {

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



