
(function(){

    var m                       = window.MetaphorJs,
        extend                  = m.extend,
        nextUid                 = m.nextUid,
        Observable              = m.lib.Observable,
        Watchable               = m.lib.Watchable,

        createWatchable         = Watchable.create,

        startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        observer                = new Observable,

        factory                 = function(scope, origin, parent, userData, recursive) {

            if (!origin || typeof origin != "string" || origin.indexOf(startSymbol) == -1) {
                return null;
            }

            return new TextRenderer(scope, origin, parent, userData, recursive);
        };

    var TextRenderer = function(scope, origin, parent, userData, recursive) {

        var self        = this;

        self.id         = nextUid();
        self.origin     = origin;
        self.scope      = scope;
        self.parent     = parent;
        self.isRoot     = !parent;
        self.data       = userData;

        if (recursive === true || recursive === false) {
            self.recursive = recursive;
        }

        self.watchers   = [];
        self.children   = [];

        self.processed  = self.processText(origin);
        self.render();
    };

    extend(TextRenderer.prototype, {

        id: null,
        parent: null,
        isRoot: null,
        scope: null,
        origin: "",
        template: null,
        text: null,
        watchers: null,
        children: null,
        data: null,
        recursive: false,

        subscribe: function(fn, context) {
            return observer.on(this.id, fn, context);
        },

        unsubscribe: function(fn, context) {
            return observer.un(this.id, fn, context);
        },

        toString: function() {
            var self = this;
            if (self.text === null) {
                self.render();
            }
            return self.text;
        },

        toSource: function() {
            return this.origin;
        },


        render: function() {

            var self    = this,
                text    = self.processed,
                i, l,
                ch;

            if (!self.children.length) {
                self.createChildren();
            }

            ch = self.children;

            for (i = -1, l = ch.length; ++i < l;
                 text = text.replace('---' + i + '---', ch[i].toString())) {}

            self.text = text;
            return text;
        },



        processText: function(text) {

            var self    = this,
                index   = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                separators = [];

            while(index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) != -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1)) {

                    separators.push(text.substring(index, startIndex));

                    if (endIndex != startIndex + startSymbolLength) {
                        separators.push(self.watcherMatch(text.substring(startIndex + startSymbolLength, endIndex)));
                    }

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation, so we have to add the remainder to the separators array
                    if (index !== textLength) {
                        separators.push(text.substring(index));
                    }
                    break;
                }
            }

            return separators.join("");
        },

        watcherMatch: function(expr) {

            var self    = this,
                ws      = self.watchers;

            ws.push(createWatchable(
                self.scope,
                expr,
                self.onDataChange,
                self
            ));

            return '---'+ (ws.length-1) +'---';
        },

        onDataChange: function(val, prev) {

            var self    = this;

            self.destroyChildren();
            self.triggerChange();
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
                ch.push((rec && factory(scope, val, self)) || val);
            }
        },

        destroyChildren: function() {

            var self    = this,
                ch      = self.children,
                i, l;

            for (i = -1, l = ch.length; ++i < l; ){
                if (ch[i] instanceof TextRenderer) {
                    ch[i].destroy();
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

            var self    = this;

            self.destroyChildren();
            self.destroyWatchers();

            observer.destroyEvent(self.id);

            delete self.watchers;
            delete self.children;
            delete self.origin;
            delete self.template;
            delete self.text;
            delete self.scope;
            delete self.data;

        }

    }, true, false);



    TextRenderer.create = factory;

    m.r("MetaphorJs.view.TextRenderer", TextRenderer);

}());