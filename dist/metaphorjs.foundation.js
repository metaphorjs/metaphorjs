(function(){

    "use strict";

    var undef   = {}.undefined;

    var apply   = function(dst, src, override) {
        if (src && dst) {
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    if (override !== false || dst[k] == undef) {
                        dst[k] = src[k];
                    }
                }
            }
        }
    };

    var Metaphor  = {
        apply:      apply,
        emptyFn:    function() {}
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

    var getNs       = function(ns) {

        if (cache[ns]) {
            return cache[ns];
        }

        var tmp     = ns.split("."),
            i,
            len     = tmp.length,
            name,
            current = root;

        for (i = 0; i < len - 1; i++) {

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
        getNs:      getNs
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
                what[k] = isFn(o[k]) && isFn(parent[proto][k]) ?
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

        return fn;
    };

    MetaphorJs.define   = function(ns, parentClass, cls, statics) {

        if (!cls) {
            cls         = parentClass;
            parentClass = null;
        }

        var p   = parentClass && typeof parentClass == "string" ?
                    MetaphorJs.ns.getNs(parentClass) :
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
        return c;
    };

    MetaphorJs.create = function(ns, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {

        var cls = MetaphorJs.ns.getNs(ns),
            c;

        if (!cls) {
            throw new Error(cls + " not found");
        }

        c = new cls(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)

        c.__parent      = cls.__parent;
        c.__parentClass = cls.__parentClass;
        c.__class       = cls.__class;

        return c;
    };

    MetaphorJs.is = function(cmp, cls) {
        var _cls    = typeof cls == "string" ? MetaphorJs.ns.getNs(cls) : cls;
        return cmp instanceof _cls;
    };

    MetaphorJs.isSubclass = function(child, parent) {

        var p = child;

        if (typeof parent != "string") {
            parent  = parent.__class;
        }

        while (p) {
            if (p == parent) {
                return true;
            }
            p = MetaphorJs.ns.getNs(p);
            if (p) {
                p = p.__parentClass;
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
		hash 		    = randomHash(),
		suspended	    = false,
		lid			    = 0,
		self 		    = this,
        returnResult    = returnResult || false; // first|last|all

	extend(self, {

		destroy: function() {
			listeners 	= null;
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
			listeners = [];
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
                res;

			for (var i = 0, len = listeners.length; i < len; i++) {

				var l = listeners[i];

				l.count++;

				if (l.count < l.start) {
                    continue;
                }

				res = l.fn.apply(l.scope, arguments);

				l.called++;

				if (l.called == l.limit) {
                    self.removeListener(l.id);
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


}());

MetaphorJs.define("MetaphorJs.data.Store", "MetaphorJs.cmp.Observable",
    {
        autoLoad:       false,
        idProperty:     "id",
        totalProperty:  "total",
        root:           "record",
        startParam:     "start",
        limitParam:     "limit",
        pageSize:       null,
        clearOnLoad:    true,

        fields:         null,
        recordType:     null, //"MetaphorJs.data.Record",
        destroyRecords: true,

        ajaxOpt:        {
            type:       'GET'
        },
        ajaxData:       null,
        extraParams:    {},


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

        loadXHR:        null,

        filtered:       false,
        filterBackup:   null,


        initialize:     function(url, options, extraParams, initialData) {

            var self        = this;

            self.items      = [];
            self.map        = {};
            self.keys       = [];
            self.loaded     = false;

            if (options && typeof options == 'string') {
                options     = {root: options};
            }
            options         = options || {};

            if (url && $.isPlainObject(url)) {
                options     = url;
                url         = null;
            }

            if (extraParams) {
                options.extraParams = extraParams;
            }

            options.ajaxOpt     = options.ajaxOpt || {};

            if (options.url) {
                options.ajaxOpt.url = options.url;
            }
            if (url) {
                options.ajaxOpt.url = url;
            }

            self.supr(options);

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


        load: function(params, add, cb, cbScope) {

            var self    = this;

            if (self.loadXHR) {
                self.loadXHR.abort();
            }

            params      = params || {};

            if (self.trigger("beforeload", self) === false) {
                return;
            }

            self.loading    = true;

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            if (!add && self.clearOnLoad && self.length > 0) {
                self.clear();
            }

            var opt     = $.extend({}, self.ajaxOpt);
            opt.data    = $.extend({}, self.extraParams, params);
            opt.context = self;
            opt.success = self.loadAjaxData;

            if (self.pageSize !== null && !params[self.startParam] && !params[self.limitParam]) {
                opt.data[self.startParam]    = self.start;
                opt.data[self.limitParam]    = self.pageSize;
            }

            self.loadXHR = $.ajax(opt);
            self.loadXHR.always(function(){
                self.loadXHR    = null;
            });

        },

        loadAjaxData: function(data) {

            var self    = this;

            self.ajaxData   = $.extend({}, data);

            if (data[self.root]) {

                var recs    = data[self.root],
                    total   = parseInt(data[self.totalProperty]);

                if ($.isArray(recs)) {
                    self.loadData(recs);
                    self.totalLength    = total || self.length;
                }
            }
        },

        getAjaxData: function() {
            return this.ajaxData;
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

                self.loadData(recs);
                self.totalLength    = self.length;
            }
        },

        loadData: function(recs) {
            var self    = this;

            self.clearFilter(true);

            self.suspendAllEvents();

            for (var i = 0; i < recs.length; i++) {
                self.add(recs[i]);
            }

            self.resumeAllEvents();
            self.loaded     = true;
            self.loading    = false;

            self.trigger("load", self);
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
                    cb.call(cbScope || window);
                }
            }
        },

        reload: function(cb, cbScope) {

            var self    = this;

            if (self.local) {
                return;
            }

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            self.load();
        },

        addNextPage: function(cb, cbScope) {

            var self    = this;

            if (self.local || self.length >= self.totalLength) {
                return;
            }

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            self.load({
                start:      self.length,
                limit:      self.pageSize
            }, true);
        },

        loadNextPage: function(cb, cbScope) {

            var self    = this;

            if (self.local) {
                return;
            }

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            self.start += self.pageSize;
            self.load();
        },

        loadPrevPage: function(cb, cbScope) {

            var self    = this;

            if (self.local) {
                return;
            }

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            self.start -= self.pageSize;
            self.load();
        },


        setParam: function(k, v) {
            this.extraParams[k] = v;
        },

        getParam: function(k) {
            return this.extraParams[k];
        },



        getRecordId: function(rec) {
            if (this.recordType) {
                return rec.getId();
            }
            else {
                return rec[this.idProperty] || null;
            }
        },

        processDataItem: function(item) {

            var self    = this;

            if (!self.recordType) {
                return item;
            }
            else {

                if (MetaphorJs.is(item, self.recordType)) {
                    return item;
                }

                return MetaphorJs.create(self.recordType, item, self.fields, {
                    idProperty:     self.idProperty,
                    listeners: {
                        scope:      self,
                        change:     self.onRecordChange,
                        destroy:    self.onRecordDestroy
                    }
                });
            }
        },

        onRecordChange: function(k, v, prev, rec) {
            this.trigger("update", this, rec);
        },

        onRecordDestroy: function(rec) {
            this.remove(rec);
        },

        getAt: function(index) {
            return this.items[index] || null;
        },

        getById: function(id) {
            return this.map[id] || null;
        },

        add: function(id, rec, silent) {

            var self    = this;

            if (typeof id != "string" && typeof id != "number") {

                rec = arguments[0];

                if ($.isArray(rec)) {

                    if (!rec.length) {
                        return;
                    }

                    var prevLength  = self.length;

                    for (var i = 0, len = rec.length; i < len; i++) {
                        rec[i]  = self.processDataItem(rec[i]);
                        self.add(self.getRecordId(rec[i]), rec[i], true);
                    }

                    if (!silent) {
                        // fn(index, rec)
                        self.trigger('add', prevLength, rec);
                    }
                    return;
                }
                else {
                    rec = self.processDataItem(rec);
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

            if (!silent) {
                self.trigger('add', self.length - 1, [rec]);
            }
        },

        /**
         * @protected
         */
        detachRecord: function(rec) {
            rec.un("change", self.onRecordChange, self);
            rec.un("destroy", self.onRecordDestroy, self);
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

                if (self.recordType) {
                    self.detachRecord(rec);
                }

                if (self.recordType && self.destroyRecords) {
                    rec.destroy();
                    return rec = null;
                }
                else {
                    return rec;
                }
            }
            return false;
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
            self.reset();
            self.trigger('clear', recs);
        },

        reset: function() {
            this._reset();
        },

        /**
         * @private
         */
        _reset: function(noRecordType) {
            var self    = this,
                ds      = self.destroyRecords,
                i, len;

            if (!noRecordType && self.recordType) {
                for (i = 0, len = self.items.length; i < len; i++) {
                    self.detachRecord(self.items[i]);
                    if (ds) {
                        self.items[i].destroy();
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

        destroy: function() {

            var self    = this;

            self.trigger("destroy", self);
            self.removeAllListeners("clear");
            self.clear();

            self.supr();
        },


        insert: function(index, id, rec) {
            var self = this;
            if(arguments.length == 2){
                rec = arguments[1];
                id = self.getRecordId(rec);
            }
            rec = self.processDataItem(rec);
            if(self.containsId(id)){
                self.suspendAllEvents();
                self.removeId(id);
                self.resumeAllEvents();
            }
            if(index >= self.length){
                return self.add(id, rec);
            }
            self.length++;
            self.items.splice(index, 0, rec);
            if(typeof id != 'undefined' && id !== null){
                self.map[id] = rec;
            }
            self.keys.splice(index, 0, id);
            self.trigger('add', index, [rec]);
            return rec;
        },

        indexOf: function(rec) {
            return this.items.indexOf(rec);
        },

        indexOfId: function(id) {
            return this.keys.indexOf(id);
        },

        getCount: function() {
            return this.length;
        },

        getTotalCount: function() {
            return this.totalLength;
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


        replace: function(id, rec) {
            var self    = this;
            if(arguments.length == 1){
                rec = arguments[0];
                id = self.getRecordId(rec);
            }
            rec         = self.processDataItem(rec);
            var old = self.map[id];
            if(typeof id == 'undefined' || id === null || typeof old == 'undefined'){
                return self.add(id, rec);
            }

            if (self.recordType) {
                self.detachRecord(old);

                if (self.destroyRecords) {
                    old.destroy();
                    old = null;
                }
            }

            var index = self.indexOfId(id);
            self.items[index] = rec;
            self.map[id] = rec;
            self.trigger('replace', id, old, rec);
            return rec;
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
                rt      = self.recordType ? true : false,
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


        filter: function(fn, fnScope, params) {

            var self    = this;
            self.trigger("beforefilter", self);
            self.suspendAllEvents();

            if (!self.filterBackup) {
                self.filterBackup   = {
                    length:         self.length,
                    totalLength:    self.totalLength,
                    items:          self.items,
                    keys:           self.keys,
                    map:            self.map
                };
            }

            self._reset(true);

            self.filtered           = true;

            var k   = self.filterBackup.keys,
                it  = self.filterBackup.items;

            for(var i = 0, len = it.length; i < len; i++){
                if(fn.call(fnScope, it[i], k[i], params)){
                    self.items.push(it[i]);
                    self.keys.push(k[i]);
                    self.length++;
                    self.map[k[i]] = it[i];
                }
            }

            self.totalLength    = self.length;

            self.resumeAllEvents();
            self.trigger("filter", self);
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
            self.totalLength    = self.filterBackup.totalLength;
            self.items          = self.filterBackup.items;
            self.keys           = self.filterBackup.keys;
            self.map            = self.filterBackup.map;

            self.filterBackup   = null;

            self.resumeAllEvents();

            if (!silent) {
                self.trigger("clearfilter", self);
            }
        },


        collect: function(f) {

            var coll    = [],
                self    = this,
                rt      = self.recordType;

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
            var s   = MetaphorJs.create("MetaphorJs.data.Store", {idProperty: 0});
            s.loadArray(d);
            return s;
        }
    }
);


MetaphorJs.define("MetaphorJs.data.Record", "MetaphorJs.cmp.Observable", {

    data:       {},
    fields:     {},
    idProperty: null,
    id:         null,

    initialize: function(data, fields, cfg) {

        var self    = this;

        self.supr(cfg);

        self.fields = fields || {};
        self.data   = self.processRawData(data);

        if (self.idProperty) {
            self.id     = self.data[self.idProperty];
        }
    },

    processRawData: function(data) {

        var self        = this,
            processed   = {},
            name;

        for (name in data) {
            processed[name] = self.restoreField(name, data[name]);
        }

        return processed;
    },

    restoreField: function(name, value) {

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
                        if (value === "off" || value === "no" || value === "0") {
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
            }

            if (f.process) {
                value   = f.process.call(self, value, name);
            }
        }

        return self.onRestoreField(name, value);
    },

    onRestoreField: function(name, value) {
        return value;
    },

    getId: function() {
        return this.id;
    },

    getData: function() {
        return $.extend({}, this.data);
    },

    get: function(key) {
        return this.data[key];
    },

    set: function(key, value) {

        var self    = this,
            prev    = self.data[key];

        self.data[key]  = self.restoreField(key, value);

        self.trigger("change", key, value, prev, self);
    },

    destroy: function() {

        var self    = this;

        self.trigger("destroy", self);

        self.data   = {};
        self.fields = null;

        self.supr();
    }

});
