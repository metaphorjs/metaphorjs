(function(){

    "use strict";

    var undef   = {}.undefined;

    var apply   = function(dst, src, override) {
        if (src && dst) {
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    if (dst[k] && typeof dst[k] == "object" && typeof src[k] == "object") {
                        apply(dst[k], src[k]);
                    }
                    else {
                        if (override !== false || dst[k] === undef || dst[k] === null) {
                            dst[k] = src[k];
                        }
                    }
                }
            }
        }
    };

    var Metaphor  = {
        apply:      apply,
        emptyFn:    function() {},
        cookie:     {
            set: function(name, value, expires) {

                if (expires && typeof expires == 'number') {
                    expires	= new Date( (new Date).getTime() + (expires * 1000) );
                }

                value	= encodeURIComponent(value) +
                            (expires ? "; expires=" + expires.toUTCString() : "") +
                            "; path=/";
                document.cookie	= encodeURIComponent(name) + "=" + value;
            },

            get: function(name) {

                var x,y,cookies = document.cookie.split(";");

                for (var i = 0, len = cookies.length; i < len; i++) {

                    x = cookies[i].substr(0, cookies[i].indexOf("="));
                    y = cookies[i].substr(cookies[i].indexOf("=") + 1);

                    x = x.replace(/^\s+|\s+$/g,"");
                    if (x == name) {
                        return decodeURIComponent(y);
                    }
                }

                return null;
            }
        },
        fn: {
            delegate : function(fn, scope){
                return function() {
                    return fn.apply(scope, arguments);
                };
            },

            defer : function(ms, fn, scope){
                var fn = this.delegate(fn, scope);
                return setTimeout(fn, ms);
            },

            countdown: function(cnt, fn, scope) {
                var cnt = parseInt(cnt, 10);
                return function() {
                    cnt--;
                    if (cnt == 0) {
                        fn.apply(scope, arguments);
                    }
                };
            }
        }
    };

    if (window.MetaphorJs) {
        apply(window.MetaphorJs, Metaphor, true);
    }
    else {
        window.MetaphorJs = Metaphor;
    }
}());
(function(){

    "use strict";

    var root        = window,
        cache       = {};

    var parseNs     = function(ns) {

        var tmp     = ns.split("."),
            i,
            last    = tmp.pop(),
            parent  = tmp.join("."),
            len     = tmp.length,
            name,
            current = root;

        if (cache[parent]) {
            return [cache[parent], last];
        }

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (!current[name]) {
                current[name]   = {};
            }

            current = current[name];
        }

        return [current, last];
    };

    var get       = function(ns) {

        if (cache[ns]) {
            return cache[ns];
        }

        var tmp     = ns.split("."),
            i,
            len     = tmp.length,
            name,
            current = root;

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (!current[name]) {
                return null;
            }

            current = current[name];
        }

        return current;
    };

    var register    = function(ns, fn) {

        var parse   = parseNs(ns),
            parent  = parse[0],
            name    = parse[1];

        parent[name]    = fn;
        cache[ns]       = fn;
    };

    var exists      = function(ns) {
        return cache[ns] ? true : false;
    };

    register("MetaphorJs.ns", {
        register:   register,
        exists:     exists,
        get:        get,
        add:        function(ns, c) {
            cache[ns] = c;
        },
        remove:     function(ns) {
            delete cache[ns];
        }
    });

}());
/*!
 * inspired by and based on klass
 */

(function(){

    "use strict";

    var undef   = {}.undefined,
        proto   = "prototype";

    var isFn    = function(f) {
        return typeof f === "function";
    };

    var create  = function(cls) {
        return extend(function(){}, cls);
    };

    var wrap    = function(parent, k, fn) {
        return function() {
            var ret     = undef;
            this.supr   = parent[proto][k] || function(){};
            try {
                ret     = fn.apply(this, arguments);
            } finally {}
            this.supr   = null;
            return ret;
        };
    };

    var process = function(what, o, parent) {
        for (var k in o) {
            if (o.hasOwnProperty(k)) {
                what[k] = isFn(o[k]) && parent[proto] && isFn(parent[proto][k]) ?
                            wrap(parent, k, o[k]) :
                            o[k];
            }
        }
    };

    var extend  = function(parent, cls) {

        var noop        = function(){};
        noop[proto]     = parent[proto];
        var prototype   = new noop;

        var fn = function() {
            if (this.initialize) {
                this.initialize.apply(this, arguments);
            }
        };

        process(prototype, cls, parent);
        fn[proto]   = prototype;
        fn[proto].constructor = fn;
        fn[proto].getClass = function() {
            return this.__proto__.constructor.__class;
        };
        fn[proto].getParentClass = function() {
            return this.__proto__.constructor.__parentClass;
        };
        fn.__instantiate = function(fn) {

            return function() {
                var Temp = function(){},
                    inst, ret;

                Temp.prototype  = fn.prototype;
                inst            = new Temp;
                ret             = fn.prototype.constructor.apply(inst, arguments);

                // If an object has been returned then return it otherwise
                // return the original instance.
                // (consistent with behaviour of the new operator)
                return typeof ret == "object" ? ret : inst;
            };
        }(fn);

        return fn;
    };

    MetaphorJs.define = MetaphorJs.d = function(ns, parentClass, cls, statics) {

        if (typeof parentClass != "string") {
            statics     = cls;
            cls         = parentClass;
            parentClass = null;
        }

        var p   = parentClass && typeof parentClass == "string" ?
                    MetaphorJs.ns.get(parentClass) :
                    parentClass;

        if (parentClass && !p) {
            throw new Error(parentClass + " not found");
        }

        var c   = p ? extend(p, cls) : create(cls);

        c.__parent          = p;
        c.__parentClass     = p ? p.__class : null;
        c.__class           = ns;

        if (statics) {
            for (var k in statics) {
                if (statics.hasOwnProperty(k)) {
                    c[k] = statics[k];
                }
            }
        }

        MetaphorJs.ns.register(ns, c);

        if (cls.alias) {
            MetaphorJs.ns.add(cls.alias, c);
        }

        return c;
    };

    MetaphorJs.create = MetaphorJs.c = function(ns) {

        var cls     = MetaphorJs.ns.get(ns),
            args    = Array.prototype.slice.call(arguments, 1);

        if (!cls) {
            throw new Error(ns + " not found");
        }

        return cls.__instantiate.apply(this, args);
    };

    MetaphorJs.is = function(cmp, cls) {
        var _cls    = typeof cls == "string" ? MetaphorJs.ns.get(cls) : cls;
        return _cls ? cmp instanceof _cls : false;
    };

    MetaphorJs.isSubclass = MetaphorJs.iss = function(child, parent) {

        var p = child;

        if (typeof parent != "string") {
            parent  = parent.getClass();
        }

        while (p) {
            if (p == parent) {
                return true;
            }
            p = MetaphorJs.ns.get(p);
            if (p) {
                p = p.getParentClass();
            }
        }

        return false;
    };

}());

MetaphorJs.define("MetaphorJs.cmp.Base", {

    initialize: function(cfg) {
        cfg     = cfg || {};
        MetaphorJs.apply(this, cfg);
    },

    destroy: MetaphorJs.emptyFn

});


/**
 * MetaphorJs.lib.Observable 1.1
 * @author johann kuindji
 * @github https://github.com/kuindji/metaphorjs-observable
 */

(function(){

"use strict";


var randomHash = function() {
    var N = 10;
    return new Array(N+1).join((Math.random().toString(36)+'00000000000000000')
                .slice(2, 18)).slice(0, N)
};

var extend = function(trg) {
    var i, j, len, src;

    for (j = 1, len = arguments.length; j < len; j++) {
        src     = arguments[j];
        for (i in src) {
            trg[i] = src[i];
        }
    }
};

var event = function(name, returnResult) {

    var listeners 	    = [],
        map             = {},
        hash 		    = randomHash(),
        suspended	    = false,
        lid			    = 0,
        self 		    = this,
        returnResult    = returnResult || false; // first|last|all

    extend(self, {

        destroy: function() {
            listeners 	= null;
            map         = null;
            hash 		= null;
            suspended 	= null;
            lid 		= null;
            self 		= null;
            name 		= null;
        },


        on: function(fn, scope, options) {

            if (!fn) {
                return;
            }

            scope       = scope || fn;
            options     = options || {};

            var uni     = name+"_"+hash;

            if (scope[uni]) {
                return;
            }

            var id 	    = ++lid,
                first 	= options.first || false;

            scope[uni]  = id;


            var e = {
                fn:         fn,
                scope:      scope,
                id:         id,
                called:     0, // how many times the function was triggered
                limit:      options.limit ? options.limit :
                                (options.once ? 1 : 0), // how many times the function is allowed to trigger
                start:      options.start || 1, // from which attempt it is allowed to trigger the function
                count:      0 // how many attempts to trigger the function was made
            };

            if (first) {
                listeners.unshift(e);
            }
            else {
                listeners.push(e);
            }

            map[id] = e;

            return id;
        },

        un: function(fn, scope) {

            var inx     = -1,
                uni     = name+"_"+hash,
                id;

            if (fn == parseInt(fn)) {
                id      = fn;
            }
            else {
                scope   = scope || fn;
                id      = scope[uni];
            }

            if (!id) {
                return false;
            }

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id == id) {
                    inx = i;
                    delete listeners[i].scope[uni];
                    break;
                }
            }

            if (inx == -1) {
                return false;
            }

            listeners.splice(inx, 1);
            delete map[id];
            return true;
        },

        hasListener: function(fn, scope) {

            if (fn) {

                scope   = scope || fn;
                var id,
                    uni     = name+"_"+hash;

                if (fn == parseInt(fn)) {
                    id  = fn;
                }
                else {
                    id  = scope[uni];
                }

                if (!id) {
                    return false;
                }

                for (var i = 0, len = listeners.length; i < len; i++) {
                    if (listeners[i].id == id) {
                        return true;
                    }
                }

                return false;
            }
            else {
                return listeners.length > 0 ? listeners.length : false;
            }
        },

        removeAllListeners: function() {
            var uni = name+"_"+hash;
            for (var i = 0, len = listeners.length; i < len; i++) {
                delete listeners[i].scope[uni];
            }
            listeners   = [];
            map         = {};
        },

        suspend: function() {
            suspended = true;
        },

        resume: function() {
            suspended = false;
        },

        trigger: function() {

            if (suspended || listeners.length == 0) {
                return;
            }

            var ret 	= returnResult == "all" ? [] : null,
                q       = [],
                i, len, l,
                res;

            // create a snapshot of listeners list
            for (i = 0, len = listeners.length; i < len; i++) {
                q.push(listeners[i]);
            }

            // now if during triggering someone unsubscribes
            // we won't skip any listener due to shifted
            // index
            while (l = q.shift()) {

                // listener may already have unsubsribed
                if (!l || !map[l.id]) {
                    continue;
                }

                l.count++;

                if (l.count < l.start) {
                    continue;
                }

                res = l.fn.apply(l.scope, arguments);

                l.called++;

                if (l.called == l.limit) {
                    this.un(l.id);
                }

                if (returnResult == "all") {
                    ret.push(res);
                }

                if (returnResult == "first" && res) {
                    return res;
                }

                if (returnResult == "last" && res) {
                    ret = res;
                }

                if (returnResult == false && res === false) {
                    break;
                }
            }

            if (returnResult) {
                return ret;
            }
        }
    });
};


var observable = function() {

    var self        = this,
        events      = {},
        api         = {};

    extend(api, {

        createEvent: function(name, returnResult) {
            name = name.toLowerCase();
            if (!events[name]) {
                events[name] = new event(name, returnResult);
            }
            return events[name];
        },

        getEvent: function(name) {
            name = name.toLowerCase();
            return events[name];
        },

        on: function(name, fn, scope, options) {
            name = name.toLowerCase();
            if (!events[name]) {
                events[name] = new event(name);
            }
            return events[name].on(fn, scope, options);
        },

        once: function(name, fn, scope, options) {
            options     = options || {};
            options.limit = 1;
            return self.on(name, fn, scope, options);
        },


        un: function(name, fn, scope) {
            name = name.toLowerCase();
            if (!events[name]) {
                return;
            }
            events[name].un(fn, scope);
        },

        hasListener: function(name, fn, scope) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return events[name].hasListener(fn, scope);
        },

        removeAllListeners: function(name) {
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        },

        trigger: function() {

            var a = [],
                name = arguments[0];

            name = name.toLowerCase();

            if (!events[name]) {
                return;
            }

            for (var i = 1, len = arguments.length; i < len; i++) {
                a.push(arguments[i]);
            }

            var e = events[name];
            return e.trigger.apply(e, a);
        },

        suspendEvent: function(name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return;
            }
            events[name].suspend();
        },

        suspendAllEvents: function() {
            for (var name in events) {
                events[name].suspend();
            }
        },

        resumeEvent: function(name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return;
            }
            events[name].resume();
        },

        resumeAllEvents: function() {

            for (var name in events) {
                events[name].resume();
            }
        }
    });

    extend(self, api, {

        destroy: function(name) {

            if (name) {
                name = name.toLowerCase();
                if (events[name]) {
                    events[name].destroy();
                    delete events[name];
                }
            }
            else {
                for (var i in events) {
                    events[i].destroy();
                }

                events 	= null;
                self	= null;
            }
        },

        getApi: function() {
            return api;
        }
    });

    return self;
};

if (window.MetaphorJs && MetaphorJs.ns) {
    MetaphorJs.ns.register("MetaphorJs.lib.Observable", observable);
}
else {
    window.MetaphorJs   = window.MetaphorJs || {};
    MetaphorJs.lib      = MetaphorJs.lib || {};
    MetaphorJs.lib.Observable = observable;
}

})();


MetaphorJs.define("MetaphorJs.cmp.Observable", "MetaphorJs.cmp.Base", {

    _observable:    null,
    listeners:      null,

    initialize:     function(cfg) {

        var self    = this;

        self._observable    = new MetaphorJs.lib.Observable;
        MetaphorJs.apply(self, self._observable.getApi());

        cfg     = cfg || {};

        if (cfg.callback) {

            var cb      = cfg.callback,
                scope   = cb.scope || self;
            delete cb.scope;

            for (var k in cb) {
                if (cb.hasOwnProperty(k)) {
                    self.on(k, cb[k], scope);
                }
            }

            delete cfg.callback;
        }

        self.supr(cfg);
    },

    destroy: function() {

        this._observable.destroy();
        delete this._observable;
        this.supr();
    }

});

(function(){

    "use strict";

    var cmps    = {},
        cmpInx  = -1;

    var getCmpId    = function(cmp) {
        cmpInx++;
        return cmp.id || "cmp-" + cmpInx;
    };

    var registerCmp = function(cmp) {
        cmps[cmp.id]   = cmp;
    };

    var destroyCmp  = function(cmp) {
        delete cmps[cmp.id];
    };

    var getCmp      = function(id) {
        return cmps[id] || null;
    };

    MetaphorJs.define("MetaphorJs.cmp.Component", "MetaphorJs.cmp.Observable", {

        id:             null,
        tag:            'div',
        el:             null,
        dom:            null,
        cls:            null,
        style:          null,
        renderTo:       null,
        html:           null,

        rendered:       false,
        hidden:         false,
        destroyed:      false,

        destroyEl:      true,

        initialize: function(cfg) {

            var self    = this;

            self.supr(cfg);

            if (self.dom && !self.el) {
                self.el     = $(self.dom);
            }

            if (self.el) {
                self.id     = self.el.attr('id');
                if (!self.dom) {
                    self.dom    = self.el.get(0);
                }
            }

            self.id         = getCmpId(self);

            registerCmp(self);

            self.initComponent();

            if (!self.dom && self.renderTo) {
                self.render();
            }
            else if (self.dom) {
                self.hidden     = self.el.is(':hidden');
                self.rendered   = true;
                if (self.html) {
                    self.el.html(self.html);
                    self.html   = null;
                }
                self.onRender();
            }

        },

        render: function(to) {

            var self        = this;

            if (self.rendered) {
                return;
            }

            var tag         = self.tag,
                el          = $('<'+tag+'></'+tag+'>');

            to = to || self.renderTo;

            if (self.cls) {
                el.addClass(self.cls);
            }

            if (self.style) {
                el.css(self.style);
            }

            el.attr('id', self.id);

            if (self.html) {
                el.html(self.html);
                self.html   = null;
            }

            if (self.hidden) {
                el.hide();
            }

            el.appendTo(to || 'body');

            self.el         = el;
            self.dom        = el.get(0);
            self.rendered   = true;
            self.onRender();

            self.renderTo   = null;
        },

        setContent: function(newContent) {

            var self    = this;

            if (self.rendered) {
                self.el.html(newContent);
            }
            else {
                self.html   = newContent;
            }
        },

        onRender: function() {

            var self    = this;

            self.el.attr("cmp-id", self.id);
            self.trigger('render', self);
            self.afterRender();
            self.trigger('afterrender', self);
        },

        show: function() {
            var self    = this;
            if (!self.hidden) {
                return;
            }
            if (self.trigger('beforeshow', self) === false) {
                return false;
            }
            self.el.show();
            self.hidden = false;
            self.onShow();
            self.trigger("show", self);
        },

        hide: function() {
            var self    = this;
            if (self.hidden) {
                return;
            }
            if (self.trigger('beforehide', self) === false) {
                return false;
            }
            self.el.hide();
            self.hidden = true;
            self.onHide();
            self.trigger("hide", self);
        },

        isHidden: function() {
            return this.hidden;
        },

        isRendered: function() {
            return this.rendered;
        },

        isDestroyed: function() {
            return this.destroyed;
        },

        getEl: function() {
            return this.el;
        },

        getDom: function() {
            return this.dom;
        },

        destroy: function() {

            var self    = this;

            if (self.destroyed) {
                return;
            }

            if (self.trigger('beforedestroy', self) === false) {
                return false;
            }

            self.onDestroy();
            self.destroyed  = true;

            self.trigger('destroy', self);

            if (self.destroyEl) {
                self.el.remove();
                self.el     = null;
                self.dom    = null;
            }

            self.supr();
            destroyCmp(self);
        },

        initComponent:  MetaphorJs.emptyFn,
        afterRender:    MetaphorJs.emptyFn,
        onShow:         MetaphorJs.emptyFn,
        onHide:         MetaphorJs.emptyFn,
        onDestroy:      MetaphorJs.emptyFn

    });

    MetaphorJs.getCmp           = getCmp;


    $.fn.createCmp = function(name, cfg) {

        var cmp = null;

        if (name && typeof name != "string") {
            cfg     = name;
            name    = null;
        }

        name    = name || "MetaphorJs.cmp.Component";
        cfg     = cfg || {};

        this.each(function() {

            var o   = $(this),
                id  = o.attr('cmp-id');

            if (id) {
                cmp     = getCmp(id);
                return false;
            }

            cfg.el      = o;
            cfg.dom     = this;

            cmp     = MetaphorJs.create(name, cfg);

            return false;
        });

        return cmp;
    };

    $.fn.getCmp = function() {
        return getCmp(this.attr('cmp-id'));
    };

    $.fn.getParentCmp   = function() {

        if (!this.attr("cmp-id")) {
            var parent = this.parents("[cmp-id]").eq(0);
            if (parent.length) {
                return MetaphorJs.getCmp(parent.attr("cmp-id"));
            }
        }
        else {
            return MetaphorJs.getCmp(el.attr("cmp-id"));
        }

        return null;
    };


}());

(function(){

"use strict";
var instances   = {};
var cache       = {};

MetaphorJs.define("MetaphorJs.data.Model", {

    /*
    for every type of request load/save/delete
    you can provide options loadId, loadData, loadExtra
    if not provided, id/data will be used
    "extra" is always used

    also, every type of request can be either null (none),
    url or ajaxCfg object
     */

    type:           null,
    fields:         null,
    record:         null,
    store:          null,
    plain:          false,

    initialize: function(cfg) {

        var self        = this,
            defaults    = {
                record: {
                    load:       null,
                    save:       null,
                    delete:     null,
                    id:         null,
                    data:       null,
                    success:    null,
                    extra:      {}
                },

                store: {
                    load:       null,
                    save:       null,
                    delete:     null,
                    id:         null,
                    data:       null,
                    total:      null,
                    start:      null,
                    limit:      null,
                    success:    null,
                    extra:      {}
                }
            };


        self.fields     = {};

        MetaphorJs.apply(self, cfg);

        self.record     = self.record || {};
        self.store      = self.store || {};
        self.plain      = self.type ? false : true;

        MetaphorJs.apply(self.record, defaults.record, false);
        MetaphorJs.apply(self.store, defaults.store, false);
    },

    isPlain: function() {
        return this.plain;
    },

    getRecordProp: function(type, prop) {
        return this.getProp("record", type, prop);
    },

    getStoreProp: function(type, prop) {
        return this.getProp("store", type, prop);
    },

    getProp: function(what, type, prop) {
        var profile = this[what];
        return (profile[type] && profile[type][prop]) || profile[prop] || this[prop] || null;
    },

    _createAjaxCfg: function(what, type, id, data) {

        var self        = this,
            profile     = self[what],
            cfg         = typeof profile[type] == "string" ?
                            {url: profile[type]} : profile[type],
            idProp      = self.getProp(what, type, "id"),
            dataProp    = self.getProp(what, type, "data");

        if (!cfg) {
            throw new Error(what + "." + type + " not defined");
        }

        cfg.data        = $.extend(
            true, {},
            cfg.data,
            self.extra,
            profile.extra,
            profile[type].extra
        );

        if (!cfg.type) {
            cfg.type    = type == "load" ? "GET" : "POST";
        }

        if (id) {
            cfg.data[idProp]    = id;
        }
        if (data) {
            if (dataProp) {
                cfg.data[dataProp]  = data;
            }
            else {
                cfg.data    = data;
            }
        }

        return cfg;
    },

    _processRecordResponse: function(type, response, df) {
        var self        = this,
            idProp      = self.getRecordProp(type, "id"),
            dataProp    = self.getRecordProp(type, "data"),
            data        = dataProp ? response[dataProp] : response,
            id          = (data && data[idProp]) || response[idProp];

        if (!self._getSuccess("record", type, response)) {
            df.reject(response);
        }
        else {
            df.resolve(id, data);
        }
    },

    _processStoreResponse: function(type, response, df) {
        var self        = this,
            dataProp    = self.getStoreProp(type, "data"),
            totalProp   = self.getStoreProp(type, "total"),
            data        = dataProp ? response[dataProp] : response,
            total       = totalProp ? response[totalProp] : null;

        if (!self._getSuccess("store", type, response)) {
            df.reject(response);
        }
        else {
            df.resolve(data, total);
        }
    },

    _getSuccess: function(what, type, response) {
        var self    = this,
            sucProp = self.getProp(what, type, "success");

        return sucProp ? response[sucProp] : true;
    },


    loadRecord: function(id) {

        var self    = this,
            p       = $.ajax(self._createAjaxCfg("record", "load", id)),
            df      = new jQuery.Deferred;

        p.then(
            function(response){
                self._processRecordResponse("load", response, df);
            },
            df.reject
        );

        return df.promise();
    },

    saveRecord: function(rec) {

        var self    = this,
            p       = $.ajax(self._createAjaxCfg(
                        "record", "save",
                        rec.getId(),
                        rec.storeData(rec.getData())
                    )),
            df      = new jQuery.Deferred;


        p.then(
            function(response) {
                self._processRecordResponse("save", response, df);
            },
            df.reject
        );

        return df.promise();
    },

    deleteRecord: function(rec) {
        var self    = this,
            p       = $.ajax(this._createAjaxCfg("record", "delete", rec.getId())),
            df      = new jQuery.Deferred;

        p.then(
            function(response){
                df[self._getSuccess("record", "delete", response) ? "resolve" : "reject"]();
            },
            df.reject
        );

        return df.promise();
    },





    loadStore: function(store, params, cb) {

        var self    = this,
            acfg    = self._createAjaxCfg("store", "load"),
            df      = new jQuery.Deferred,
            p;

        acfg.data   = $.extend(true, acfg.data, params);
        p           = $.ajax(acfg);

        p.then(
            function(response) {
                self._processStoreResponse("load", response, df);
            },
            df.reject
        );

        return df.promise();
    },

    saveStore: function(store, recordData) {

        var self    = this,
            p       = $.ajax(self._createAjaxCfg("store", "save", null, recordData)),
            df      = new jQuery.Deferred;

        p.then(
            function(response) {
                self._processStoreResponse("save", response, df);
            },
            df.reject
        );

        return df.promise();
    },

    deleteRecords: function(store, ids) {

        var self    = this,
            p       = $.ajax(self._createAjaxCfg("store", "delete", ids)),
            df      = new jQuery.Deferred;

        p.then(
            function(response) {
                df[self._getSuccess("store", "delete", response) ? "resolve" : "reject"]();
            },
            df.reject
        );

        return df.promise();
    },








    getFields: function() {
        return this.fields;
    },

    restoreField: function(rec, name, value) {

        var self    = this,
            f       = self.fields[name];

        if (f) {
            var type = typeof f == "string" ? f : f.type;

            switch (type) {
                case "int": {
                    value   = parseInt(value);
                    break;
                }
                case "bool":
                case "boolean": {
                    if (typeof value == "string") {
                        value   = value.toLowerCase();
                        if (value === "off" || value === "no" || value === "0" ||
                            value == "false" || value == "null") {
                            value = false;
                        }
                        else {
                            value = true;
                        }
                    }
                    else {
                        value = value ? true : false;
                    }
                    break;
                }
                case "double":
                case "float": {
                    value   = parseFloat(value);
                    break;
                }
                case "date": {
                    if (f.parseFn) {
                        value   = f.parseFn(value, f.format);
                    }
                    else if (Date.parse) {
                        value   = Date.parse(value, f.format);
                    }
                    else {
                        if (f.format == "timestamp") {
                            value   = parseInt(value) * 1000;
                        }
                        value   = new Date(value);
                    }
                    break;
                }
            }

            if (f.restore) {
                value   = f.restore.call(rec, value, name);
            }
        }

        return self.onRestoreField(rec, name, value);
    },

    onRestoreField: function(rec, name, value) {
        return value;
    },

    storeField: function(rec, name, value) {

        var self    = this,
            f       = self.fields[name];

        if (f) {
            var type = typeof f == "string" ? f : f.type;

            switch (type) {
                case "bool":
                case "boolean": {
                    value   = value ? "1" : "0";
                    break;
                }
                case "date": {
                    if (f.formatFn) {
                        value   = f.formatFn(value, f.format);
                    }
                    else if (Date.format) {
                        value   = Date.format(value, f.format);
                    }
                    else {
                        if (f.format == "timestamp") {
                            value   = value.getTime() / 1000;
                        }
                        else {
                            value   = value.format ? value.format(f.format) : value.toString();
                        }
                    }
                    break;
                }
                default: {
                    value   = value.toString();
                }
            }

            if (f.store) {
                value   = f.store.call(rec, value, name);
            }
        }

        return self.onStoreField(rec, name, value);

    },

    onStoreField: function(rec, name, value) {
        return value;
    }


}, {

    /**
     * @returns MetaphorJs.data.Model
     */
    create: function(model, cfg) {

        if (model == "MetaphorJs.data.Model") {
            return MetaphorJs.create(model, cfg);
        }
        else {
            if (cfg) {
                return MetaphorJs.create(model, cfg);
            }
            else {
                if (instances[model]) {
                    return instances[model];
                }
                else {
                    return instances[model] = MetaphorJs.create(model);
                }
            }
        }
    },

    addToCache: function(rec) {

        var cls     = rec.getClass(),
            id      = rec.getId();

        if (cls != "MetaphorJs.data.Record") {
            if (!cache[cls]) {
                cache[cls] = {};
            }
            cache[cls][id] = rec;
        }
    },

    getFromCache: function(type, id) {

        if (cache[type] && cache[type][id]) {
            return cache[type][id];
        }
        else {
            return null;
        }
    },

    removeFromCache: function(type, id) {
        if (cache[type] && cache[type][id]) {
            delete cache[type][id];
        }
    }

});



}());

(function(){

"use strict";

var storeId     = 0;
var allStores   = {};


MetaphorJs.define("MetaphorJs.data.Store", "MetaphorJs.cmp.Observable",
    {
        id:             null,
        autoLoad:       false,
        clearOnLoad:    true,

        model:          null,       //"MetaphorJs.data.Record",

        loaded:         false,
        loading:        false,
        local:          false,

        items:          null,
        map:            null,
        keys:           null,
        length:         0,
        totalLength:    0,
        start:          0,
        pages:          null,

        filtered:       false,
        filterBackup:   null,
        filterFn:       null,
        filterScope:    null,
        filterParams:   null,

        initialize:     function(url, options, initialData) {

            var self        = this;

            self.items      = [];
            self.map        = {};
            self.keys       = [];
            self.loaded     = false;

            if (url && typeof url != "string") {
                initialData = options;
                options     = url;
                url         = null;
            }

            options         = options || {};

            self.supr(options);

            self.id             = self.id || ++storeId;
            allStores[self.id]  = self;

            if (typeof self.model == "string") {
                self.model  = MetaphorJs.create(self.model);
            }
            else if (!MetaphorJs.is(self.model, "MetaphorJs.data.Model")) {
                self.model  = MetaphorJs.create("MetaphorJs.data.Model", self.model);
            }

            if (url || options.url) {
                self.model.store.load    = url || options.url;
            }


            if (!self.local && self.autoLoad) {
                self.load();
            }
            else if (initialData) {
                if ($.isArray(initialData)) {
                    self.loadArray(initialData);
                }
                else {
                    self.loadAjaxData(initialData);
                }
            }

            if (self.local) {
                self.loaded     = true;
            }
        },

        getId: function() {
            return this.id;
        },

        isLoaded: function() {
            return this.loaded;
        },

        isLocal: function() {
            return this.local;
        },

        setLocal: function(state) {
            this.local  = state ? true : false;
        },

        isLoading: function() {
            return this.loading;
        },

        isFiltered: function() {
            return this.filtered;
        },

        getLength: function() {
            return this.length;
        },

        getTotalLength: function() {
            return this.filtered ?
                        this.length : (this.totalLength || this.length);
        },

        getPagesCount: function() {

            var self    = this;

            if (self.pageSize !== null) {
                return parseInt(self.totalLength / self.pageSize);
            }
            else {
                return 1;
            }
        },

        setParam: function(k, v) {
            this.model.store.extra[k] = v;
        },

        getParam: function(k) {
            return this.model.store.extra[k];
        },

        getAjaxData: function() {
            return this.ajaxData;
        },

        hasDirty: function() {
            if (this.model.isPlain()) {
                return false;
            }
            var ret = false;
            this.each(function(rec){
                if (rec.isDirty()) {
                    ret = true;
                    return false;
                }
            });
            return ret;
        },

        getDirty: function() {
            var recs    = [];
            if (this.model.isPlain()) {
                return recs;
            }
            this.each(function(rec){
                if (rec.isDirty()) {
                    recs.push(rec);
                }
            });
            return recs;
        },




        import: function(recs) {
            var self    = this;

            self.suspendAllEvents();

            for (var i = 0; i < recs.length; i++) {
                self.add(recs[i]);
            }

            self.resumeAllEvents();
            self.loaded     = true;
            self.loading    = false;

            self.trigger("load", self);
        },

        load: function(params) {

            var self    = this,
                ms      = self.model.store,
                sp      = ms.start,
                lp      = ms.limit;

            params      = params || {};

            if (self.pageSize !== null && !params[sp] && !params[lp]) {
                params[sp]    = self.start;
                params[lp]    = self.pageSize;
            }

            if (self.trigger("beforeload", self) === false) {
                return;
            }

            return self.model.loadStore(self, params).then(
                function(data, total) {
                    self.import(data);
                    self.totalLength    = parseInt(total);
                },
                function() {
                    self.trigger("failedload", self);
                }
            );
        },

        save: function() {

            var self    = this,
                recs    = {},
                cnt     = 0;

            if (self.model.isPlain()) {
                throw new Error("Cannot save plain store");
            }

            self.each(function(rec) {
                if (rec.isDirty()) {
                    recs[rec.getId()] = rec.storeData(rec.getData());
                    cnt++;
                }
            });

            if (!cnt) {
                throw new Error("Nothing to save");
            }

            if (self.trigger("beforesave", self, recs) === false) {
                return;
            }

            return self.model.saveStore(self, recs).then(
                function(data) {

                    var i, len,
                        id, rec;

                    if (data && data.length) {
                        for (i = 0, len = data.length; i < len; i++) {

                            id      = self.getRecordId(data[i]);
                            rec     = self.getById(id);

                            if (rec) {
                                rec.import(data[i]);
                            }
                        }
                    }

                    self.trigger("save", self);
                },
                function() {
                    self.trigger("failedsave", self);
                }
            );
        },

        deleteById: function(ids) {

            var self    = this,
                i, len, rec;

            if (!ids || ($.isArray(ids) && !ids.length)) {
                throw new Error("Record id required");
            }

            if (!$.isArray(ids)) {
                ids = [ids];
            }

            for (i = 0, len = ids.length; i < len; i++){
                rec = self.getById(ids[i]);
                if (rec instanceof MetaphorJs.data.Record) {
                    rec.destroy();
                }
                else {
                    self.removeId(ids[i]);
                }
            }

            if (self.trigger("beforedelete", self, ids) === false) {
                return;
            }

            return self.model.deleteRecords(self, ids).then(
                function() {
                    self.trigger("delete", self, ids);
                },
                function() {
                    self.trigger("faileddelete", self, ids);
                }
            );
        },

        deleteAt: function(inx) {
            var self    = this,
                rec     = self.getAt(inx);

            if (!rec) {
                throw new Error("Record not found at " + inx);
            }
            return self.deleteRecord(rec);
        },

        delete: function(rec) {
            var self    = this;
            return self.deleteById(self.getRecordId(rec));
        },

        deleteRecords: function(recs) {
            var ids     = [],
                self    = this,
                i, len;

            for (i = 0, len = recs.length; i < len; i++) {
                ids.push(self.getRecordId(recs[i]));
            }

            return self.deleteById(ids);
        },

        loadAjaxData: function(data) {

            var self    = this;

            if (self.trigger("beforeload", self) === false) {
                return;
            }

            self.model._processStoreResponse("load", data, {
                resolve: function(data, total) {
                    self.import(data);
                    self.totalLength    = parseInt(total);
                },
                reject: function() {

                }
            });
        },

        loadArray: function(recs, add) {

            var self    = this;

            if (self.trigger("beforeload", self) === false) {
                return;
            }

            if (!add && self.clearOnLoad && self.length > 0) {
                self.clear();
            }

            if ($.isArray(recs)) {
                self.import(recs);
                self.totalLength    = self.length;
            }
        },

        /**
         * Load store if not loaded or call provided callback
         */
        loadOr: function(cb, cbScope) {

            var self    = this;

            if (self.local) {
                return;
            }

            if (!self.isLoading()) {
                if (!self.isLoaded()) {
                    self.load();
                }
                else if (cb) {
                    cb.call(cbScope || self);
                }
            }
        },

        addNextPage: function() {

            var self    = this;

            if (!self.local && self.length < self.totalLength) {
                self.load({
                    start:      self.length,
                    limit:      self.pageSize
                }, true);
            }
        },

        loadNextPage: function() {

            var self    = this;

            if (!self.local) {
                self.start += self.pageSize;
                self.load();
            }
        },

        loadPrevPage: function() {

            var self    = this;

            if (!self.local) {
                self.start -= self.pageSize;
                self.load();
            }
        },





        getRecordId: function(rec) {
            if (rec instanceof MetaphorJs.data.Record) {
                return rec.getId();
            }
            else {
                return rec[this.model.getStoreProp("load", "id")] || null;
            }
        },

        processRawDataItem: function(item) {

            var self    = this;

            if (item instanceof MetaphorJs.data.Record) {
                return item;
            }

            if (self.model.isPlain()) {
                return item;
            }
            else {

                var type    = self.model.type,
                    id      = self.getRecordId(item),
                    r;

                if (id) {
                    r       = MetaphorJs.data.Model.getFromCache(type, id);
                }

                if (!r) {
                    r       = MetaphorJs.create(type, id, item, {
                        model:      self.model,
                        standalone: false
                    });
                }

                return r;
            }
        },

        /**
         * @protected
         */
        bindRecord: function(mode, rec) {
            var self = this;
            rec[mode]("change", self.onRecordChange, self);
            rec[mode]("destroy", self.onRecordDestroy, self);
            rec[mode]("dirtychange", self.onRecordDirtyChange, self);
            return rec;
        },

        onRecordDirtyChange: function(rec) {
            this.trigger("update", this, rec);
        },

        onRecordChange: function(rec, k, v, prev) {
            this.trigger("update", this, rec);
        },

        onRecordDestroy: function(rec) {
            this.remove(rec);
        },















        add: function(id, rec, silent) {

            var self    = this;

            if (self.filtered) {
                throw new Error("Cannot add to filtered store");
            }

            if (typeof id != "string" && typeof id != "number") {

                rec = arguments[0];

                if ($.isArray(rec)) {

                    if (!rec.length) {
                        return;
                    }

                    var prevLength  = self.length;

                    for (var i = 0, len = rec.length; i < len; i++) {
                        rec[i]  = self.processRawDataItem(rec[i]);
                        self.add(self.getRecordId(rec[i]), rec[i], true);
                    }

                    if (!silent) {
                        // fn(index, rec)
                        self.trigger('add', prevLength, rec);
                    }
                    return;
                }
                else {
                    rec = self.processRawDataItem(rec);
                    id  = self.getRecordId(rec);
                }
            }

            if (typeof id != 'undefined' && id !== null){
                var old = self.map[id];
                if(typeof old != 'undefined'){
                    self.replace(id, rec);
                    return;
                }
                self.map[id] = rec;
            }

            self.length++;
            self.items.push(rec);
            self.keys.push(id);

            if (rec instanceof MetaphorJs.data.Record) {
                rec.attachStore(self);
                self.bindRecord("on", rec);
            }

            if (!silent) {
                self.trigger('add', self.length - 1, [rec]);
            }
        },

        removeAt: function(index) {

            var self    = this;

            if(index < self.length && index >= 0){
                self.length--;
                var rec = self.items[index];
                self.items.splice(index, 1);
                var id = self.keys[index];
                if(typeof id != 'undefined'){
                    delete self.map[id];
                }
                self.keys.splice(index, 1);
                self.trigger('remove', rec, id);

                if (rec instanceof MetaphorJs.data.Record) {
                    self.bindRecord("un", rec);
                    rec.detachStore(self);
                    return rec = null;
                }
                else {
                    return rec;
                }
            }
            return false;
        },

        insert: function(index, id, rec, silent) {
            var self = this;

            if (self.filtered) {
                throw new Error("Cannot insert into filtered store");
            }

            if(arguments.length == 2){
                rec = arguments[1];
                id = self.getRecordId(rec);
            }
            rec = self.processRawDataItem(rec);
            if(self.containsId(id)){
                self.suspendAllEvents();
                self.removeId(id);
                self.resumeAllEvents();
            }
            if(index >= self.length){
                return self.add(id, rec, silent);
            }
            self.length++;
            self.items.splice(index, 0, rec);
            if(typeof id != 'undefined' && id !== null){
                self.map[id] = rec;
            }
            self.keys.splice(index, 0, id);

            if (rec instanceof MetaphorJs.data.Record) {
                rec.attachStore(self);
                self.bindRecord("on", rec);
            }

            if (!silent) {
                self.trigger('add', index, [rec]);
            }

            return rec;
        },

        replace: function(id, rec) {
            var self    = this,
                old,
                index;

            if(arguments.length == 1){
                rec     = arguments[0];
                id      = self.getRecordId(rec);
            }

            rec         = self.processRawDataItem(rec);
            old         = self.map[id];

            if(typeof id == 'undefined' || id === null || typeof old == 'undefined'){
                return self.add(id, rec);
            }

            if (old instanceof MetaphorJs.data.Record) {
                self.bindRecord("un", old);
                old.detachStore(self);
            }

            index               = self.indexOfId(id);
            self.items[index]   = rec;
            self.map[id]        = rec;

            self.trigger('replace', id, old, rec);
            return rec;
        },

        remove: function(rec) {
            return this.removeAt(this.indexOf(rec));
        },

        removeId: function(id) {
            return this.removeAt(this.indexOfId(id));
        },

        contains: function(rec) {
            return this.indexOf(rec) != -1;
        },

        containsId: function(id) {
            return typeof this.map[id] != 'undefined';
        },

        clear: function() {

            var self    = this,
                recs    = self.getRange();

            self.clearFilter(true);
            self._reset();
            self.trigger('clear', recs);
        },

        reset: function() {
            this._reset();
        },

        /**
         * @private
         */
        _reset: function(keepRecords) {
            var self    = this,
            i, len, rec;

            if (!keepRecords) {
                for (i = 0, len = self.items.length; i < len; i++) {
                    rec = self.items[i];
                    if (rec instanceof MetaphorJs.data.Record) {
                        self.bindRecord("un", rec);
                        rec.detachStore(self);
                    }
                }
            }

            self.start          = 0;
            self.length         = 0;
            self.totalLength    = 0;
            self.items          = [];
            self.keys           = [];
            self.map            = {};
            self.loaded         = self.local;
        },






        filter: function(fn, fnScope, params) {

            var self    = this;

            if (self.filtered) {
                self.clearFilter(true);
            }

            self.filtered       = true;
            self.filterFn       = fn;
            self.filterScope    = fnScope;
            self.filterParams   = params;

            self.trigger("beforefilter", self);
            self.suspendAllEvents();

            self.filterBackup   = {
                length:         self.length,
                items:          self.items,
                keys:           self.keys,
                map:            self.map
            };

            self._reset(true);

            var k   = self.filterBackup.keys,
                it  = self.filterBackup.items;

            for(var i = 0, len = it.length; i < len; i++){
                if(self._filterRecord(it[i], k[i])){
                    self.items.push(it[i]);
                    self.keys.push(k[i]);
                    self.length++;
                    self.map[k[i]] = it[i];
                }
            }

            self.resumeAllEvents();
            self.trigger("filter", self);
        },

        _filterRecord: function(rec, id) {
            var self    = this;
            return self.filtered &&
                self.filterFn.call(self.filterScope, rec, id, self.filterParams);
        },

        clearFilter: function(silent) {

            var self    = this;

            if (!self.filtered) {
                return;
            }

            if (!silent) {
                self.trigger("beforeclearfilter", self);
            }

            self.suspendAllEvents();

            self.filtered       = false;
            self._reset(true);

            self.length         = self.filterBackup.length;
            self.items          = self.filterBackup.items;
            self.keys           = self.filterBackup.keys;
            self.map            = self.filterBackup.map;
            self.filterBackup   = null;

            self.resumeAllEvents();

            if (!silent) {
                self.trigger("clearfilter", self);
            }
        },






        getAt: function(index) {
            return this.items[index] || null;
        },

        getById: function(id) {
            return this.map[id] || null;
        },

        indexOf: function(rec) {
            return this.items.indexOf(rec);
        },

        indexOfId: function(id) {
            return this.keys.indexOf(id);
        },

        each: function(fn, fnScope) {
            var items = [].concat(this.items);
            fnScope = fnScope || window;
            for(var i = 0, len = items.length; i < len; i++){
                if(fn.call(fnScope, items[i], i, len) === false){
                    break;
                }
            }
        },

        eachId: function(fn, fnScope) {
            var self    = this;
            fnScope = fnScope || window;
            for(var i = 0, len = self.keys.length; i < len; i++){
                fn.call(fnScope, self.keys[i], self.items[i], i, len);
            }
        },

        collect: function(f) {

            var coll    = [],
                self    = this,
                rt      = !self.model.isPlain();

            self.each(function(rec){

                var val;

                if (rt) {
                    val = rec.get(f);
                }
                else {
                    val = rec[f];
                }

                if (val) {
                    coll.push(val);
                }
            });

            return coll;
        },

        first : function(){
            return this.items[0];
        },

        last : function(){
            return this.items[this.length-1];
        },

        getRange : function(start, end){
            var self    = this;
            var items   = self.items;
            if(items.length < 1){
                return [];
            }
            start = start || 0;
            end = Math.min(typeof end == 'undefined' || end === null ? self.length-1 : end, self.length-1);
            var i, r = [];
            if(start <= end){
                for(i = start; i <= end; i++) {
                    r[r.length] = items[i];
                }
            }else{
                for(i = start; i >= end; i--) {
                    r[r.length] = items[i];
                }
            }
            return r;
        },

        findBy: function(fn, fnScope, start) {
            var inx = this.findIndexBy(fn, fnScope, start);
            return inx == -1 ? null : this.getAt(inx);
        },

        findIndexBy : function(fn, fnScope, start) {

            fnScope = fnScope || this;

            var k   = this.keys,
                it  = this.items;

            for(var i = (start||0), len = it.length; i < len; i++){
                if(fn.call(fnScope, it[i], k[i])){
                    return i;
                }
            }

            return -1;
        },

        find: function(property, value, exact) {

            var self    = this,
                rt      = !self.model.isPlain(),
                v;

            return self.findIndexBy(function(rec) {

                if (rt) {
                    v   = rec.get(property);
                }
                else {
                    v   = rec[property];
                }

                if (exact) {
                    return v === value;
                }
                else {
                    return v == value;
                }

            }, self);
        },

        findExact: function(property, value) {
            return this.find(property, value, true);
        },

        findBySet: function(props) {

            var found   = null,
                match,
                i;

            this.each(function(rec){

                match   = true;

                for (i in props) {
                    if (props[i] != rec[i]) {
                        match   = false;
                        break;
                    }
                }

                if (match) {
                    found   = rec;
                    return false;
                }
            });

            return found;
        },





        destroy: function() {

            var self    = this;

            delete allStores[self.id];

            self.trigger("destroy", self);
            self.removeAllListeners("clear");
            self.clear();

            self.supr();
        }



    },

    {
        createFromSelect: function(selectObj) {
            var d = [], opts = selectObj.options;
            for(var i = 0, len = opts.length;i < len; i++){
                var o = opts[i],
                    value = (o.hasAttribute ? o.hasAttribute('value') : o.getAttributeNode('value').specified) ?
                                o.value : o.text;
                d.push([value, o.text]);
            }
            var s   = MetaphorJs.create("MetaphorJs.data.Store", {server: {load: {id: 0}}});
            s.loadArray(d);
            return s;
        },


        lookupStore: function(id) {
            return allStores[id] || null;
        }
    }
);




}());

MetaphorJs.define("MetaphorJs.data.Record", "MetaphorJs.cmp.Observable", {

    id:             null,
    data:           null,
    orig:           null,
    modified:       null,
    loaded:         false,
    dirty:          false,
    destroyed:      false,
    model:          null,
    standalone:     true,
    stores:         null,

    // (id, data, cfg)
    // (id, cfg)
    // (cfg)
    initialize: function(id, data, cfg) {

        var self    = this,
            args    = arguments.length;

        if (args == 1) {
            cfg     = id;
            id      = null;
            data    = null;
        }
        else if (args == 2) {
            cfg     = data;
            data    = null;
        }

        self.orig       = {};
        self.stores     = [];
        self.modified   = {};
        self.supr(cfg);

        if (typeof self.model == "string") {
            self.model  = MetaphorJs.create(self.model);
        }
        else if (!MetaphorJs.is(self.model, "MetaphorJs.data.Model")) {
            self.model  = MetaphorJs.create("MetaphorJs.data.Model", self.model);
        }

        self.id     = id;

        if (data) {
            self.import(data);
        }
        else {
            self.load();
        }

        if (self.getClass() != "MetaphorJs.data.Record") {
            MetaphorJs.data.Model.addToCache(self);
        }
    },

    isLoaded: function() {
        return this.loaded;
    },

    isStandalone: function() {
        return this.standalone;
    },

    isDirty: function() {
        return this.dirty;
    },

    attachStore: function(store) {
        var self    = this,
            sid     = store.getId();

        if (self.stores.indexOf(sid) == -1) {
            self.stores.push(sid);
        }
    },

    detachStore: function(store) {
        var self    = this,
            sid     = store.getId(),
            inx;

        if (!self.destroyed && (inx = self.stores.indexOf(sid)) != -1) {
            self.stores.splice(inx, 1);

            if (self.stores.length == 0 && !self.standalone) {
                self.destroy();
            }
        }
    },

    setDirty: function(dirty) {
        var self    = this;
        if (self.dirty != dirty) {
            self.dirty  = dirty ? true : false;
            self.trigger("dirtychange", self, dirty);
        }
    },

    import: function(data) {

        var self        = this,
            processed   = {},
            name;

        if (data) {
            for (name in data) {
                processed[name] = self.model.restoreField(self, name, data[name]);
            }

            self.data   = processed;
        }

        self.orig       = $.extend({}, self.data);
        self.modified   = {};
        self.loaded     = true;
        self.setDirty(false);
    },

    storeData: function(data) {

        var self        = this,
            processed   = {},
            name;

        for (name in data) {
            processed[name] = self.model.storeField(self, name, data[name]);
        }

        return processed;
    },



    getId: function() {
        return this.id;
    },

    getData: function() {
        return $.extend({}, this.data);
    },

    getChanged: function() {
        return $.extend({}, this.modified);
    },

    isChanged: function(key) {
        return this.modified[key] || false;
    },

    get: function(key) {
        return this.data[key];
    },

    setId: function(id) {
        if (!this.id && id) {
            this.id = id;
        }
    },

    set: function(key, value) {

        var self    = this,
            prev    = self.data[key];

        value           = self.model.restoreField(self, key, value);
        self.data[key]  = value;

        if (prev != value) {
            self.modified[key]  = true;
            self.setDirty(true);
            self.trigger("change", self, key, value, prev);
            self.trigger("change-"+key, self, key, value, prev);
        }
    },

    revert: function() {
        var self    = this;
        if (self.dirty) {
            self.data       = $.extend({}, self.orig);
            self.modified   = {};
            self.setDirty(false);
        }
    },

    load: function() {
        var self    = this;
        self.trigger("beforeload", self);
        return self.model.loadRecord(self.id).then(
            function(id, data) {
                self.setId(id);
                self.import(data);
                self.trigger("load", self);
            },
            function() {
                self.trigger("failedload", self);
            }
        );
    },

    save: function() {
        var self    = this;
        self.trigger("beforesave", self);
        return self.model.saveRecord(self).then(
            function(id, data) {
                self.setId(id);
                self.import(data);
                self.trigger("save", self);
            },
            function() {
                self.trigger("failedsave", self);
            }
        );
    },

    delete: function() {
        var self    = this;
        self.trigger("beforedelete", self);
        return self.model.deleteRecord(self).then(
            function() {
                self.trigger("delete", self);
                self.destroy();
            },
            function() {
                self.trigger("faileddelete", self);
            }
        );
    },


    destroy: function() {

        var self    = this;

        if (self.destroyed) {
            return;
        }

        self.destroyed  = true;

        self.trigger("destroy", self);

        self.data       = null;
        self.orig       = null;
        self.modified   = null;
        self.model      = null;
        self.stores     = null;

        MetaphorJs.data.Model.removeFromCache(self.getClass(), self.id);

        self.supr();
    }

});

MetaphorJs.define("MetaphorJs.cmp.DataList", "MetaphorJs.cmp.Component", {

    store:              null,
    destroyStore:       true,

    elList:             null,
    listSelector:       null,
    itemSelector:       null,
    itemTpl:            null,

    addClearfix:        false,
    emptyText:          "",
    emptyCls:           null,

    continuousScroll:   false,
    continuousOffset:   50,
    continuousTmt:      null,
    continuousTime:     300,
    continuousSelector: null,
    elContinuous:       null,

    initComponent: function() {

        var self    = this;

        self.checkWindowScrollDelegate  = MetaphorJs.fn.delegate(self.checkWindowScroll, self);
        self.onWindowScrollDelegate     = MetaphorJs.fn.delegate(self.onWindowScroll, self);

        self.initStore();
        self.supr();
    },


    initStore: function() {
        this.setStoreEvents("on");
    },

    setStoreEvents: function(mode) {

        var self    = this,
            store   = self.store;

        if (store) {
            store[mode]("beforeload", self.onBeforeStoreLoad, self);
            store[mode]("load", self.onStoreLoad, self);
            store[mode]("filter", self.onStoreFilter, self);
            store[mode]("clearfilter", self.onStoreClearFilter, self);
            store[mode]("add", self.onStoreAdd, self);
            store[mode]("replace", self.onStoreReplace, self);
            store[mode]("remove", self.onStoreRemove, self);
            store[mode]("clear", self.onStoreClear, self);
        }
    },

    getStore: function() {
        return this.store;
    },

    afterRender: function() {

        var self    = this,
            id      = self.id;

        if (!self.elList) {
            if (self.listSelector === null) {
                self.elList     = self.el;
            }
            else {
                self.elList     = self.listSelector ?
                    $(self.listSelector, self.dom) :
                    $("#"+id+"-list");
            }
        }

        self.supr();

        if (self.store.isLoaded()) {
            self.onStoreLoad();
        }

        if (self.itemSelector) {
            self.elList.delegate(
                self.itemSelector,
                "click",
                MetaphorJs.fn.delegate(self.onRowClick, self)
            );
        }

        if (self.continuousScroll) {
            $(window).bind("scroll", self.onWindowScrollDelegate);
        }

        if (self.continuousSelector) {
            self.elContinuous = $(self.continuousSelector, self.dom);
        }

    },

    onRowClick: function(e) {

        var self    = this,
            el      = self.getItemByEvent(e),
            rec     = self.getRecordByEl(el);

        if (rec) {
            self.onItemClick(e, rec, el);
            self.trigger("itemclick", rec, el);
        }
    },

    /**
     * @param e
     * @param rec
     * @param el
     */
    onItemClick: MetaphorJs.emptyFn,

    getItemByEvent: function(e) {
        var trg     = $(e.target);
        if (!trg.is(this.itemSelector)) {
            trg     = trg.parents(this.itemSelector).eq(0);
        }
        return trg;
    },

    getElById: function(id) {
        var self    = this,
            el      = $("[data-id="+id+"]", self.dom);
        return el.length ? el : null;
    },

    getRecordByEl: function(el) {
        var id      = el.attr("data-id");
        return this.store.getById(id);
    },

    getRecordByEvent: function(e) {
        var self    = this,
            el      = self.getItemByEvent(e);
        if (el && el.length) {
            return self.getRecordByEl(el);
        }
    },





    toggleEmpty: function() {

        var self    = this,
            store   = self.store,
            empty   = store.getLength() == 0;

        self.el[empty ? "addClass" : "removeClass"](self.emptyCls);

        if (empty && self.emptyText) {
            self.elList.html(self.emptyText);
        }

        if (self.elContinuous) {
            self.elContinuous[store.getLength() >= store.getTotalLength() ? "hide" : "show"]();
        }
    },


    onBeforeStoreLoad: MetaphorJs.emptyFn,

    onStoreLoad: function() {

        var self    = this;

        if (self.rendered) {
            self.renderAll();
            self.toggleEmpty();
        }
    },

    onStoreFilter: function() {
        this.renderAll();
        this.toggleEmpty();
    },

    onStoreClearFilter: function() {
        this.renderAll();
        this.toggleEmpty();
    },

    onStoreAdd: function(inx, recs) {

        var self    = this,
            html    = self.renderRows(inx, recs),
            item;

        if (inx == 0) {
            self.elList.html(html);

            if (self.addClearfix) {
                self.elList.append(self.addClearfix);
            }
        }
        else {
            item = $(self.itemSelector + ':eq('+(inx-1)+')', self.elList.get(0));
            item.after(html);
        }

        self.toggleEmpty();
    },

    onStoreReplace: function(id, oldRec, newRec) {

        var self    = this,
            el      = self.getElById(id),
            inx     = self.store.indexOf(id),
            html    = self.renderRows(inx, [newRec]);

        el.replaceWith(html);
    },

    onStoreRemove: function(rec, id) {
        var self    = this,
            el      = self.getElById(id);

        if (el) {
            el.remove();
        }

        self.toggleEmpty();
    },

    onStoreClear: function() {
        this.elList.html("");
        this.toggleEmpty();
    },

    renderAll: function() {

        var self    = this,
            store   = self.store;

        if (store.getLength() > 0) {
            self.elList.html(self.renderRows(0, store.getRange()));
        }
        else {
            self.toggleEmpty();
        }
    },

    /**
     * @param inx
     * @param rows
     */
    renderRows: function(inx, rows) {

        var self    = this,
            html    = "",
            i, len;

        for (i = 0, len = rows.length; i < len; i++) {
            html    += self.renderOneRow(inx + i, rows[i]);
        }

        return html;
    },

    renderOneRow: function(inx, rec) {

        var self    = this,
            tpl     = self.itemTpl,
            data    = rec instanceof MetaphorJs.data.Record ? rec.getData() : rec,
            key;

        if (tpl) {
            for (key in data) {
                while (tpl.indexOf('{'+key+'}') != -1) {
                    tpl     = tpl.replace('{'+key+'}', data[key]);
                }
            }
        }

        return tpl;
    },





    onWindowScroll: function() {

        var self = this;

        if (!self.continuousTmt) {
            self.continuousTmt  = window.setTimeout(
                self.checkWindowScrollDelegate,
                self.continuousTime
            );
        }
    },

    /**
     * right now continuous scrolling works only
     * within window
     */
    checkWindowScroll: function() {

        var self    = this,
            store   = self.store;

        if (!store ||
            store.isLocal() ||
            store.getLength() >= store.getTotalLength()) {

            self.continuousTmt  = null;
            return;
        }

        var w       = $(window),
            wh      = w.height(),
            st      = w.scrollTop(),
            dsh     = document.documentElement.scrollHeight,
            bsh     = document.body.scrollHeight,
            sh      = Math.max(dsh, bsh),
            bottom  = sh - (wh + st);

        if (bottom <= self.continuousOffset) {
            self.store.addNextPage(function(){
                self.continuousTmt  = null;
            });
        }
        else {
            self.continuousTmt  = null;
        }
    },









    onDestroy: function() {

        var self    = this;

        if (self.store) {
            if (self.destroyStore) {
                self.store.destroy();
            }
            else {
                self.setStoreEvents("un");
            }
            self.store  = null;
        }

        $(window).unbind("scroll", self.onWindowScrollDelegate);

        self.supr();
    }

});

