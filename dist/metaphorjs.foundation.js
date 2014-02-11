(function(){

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

    "use strict"

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

    "use strict"

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
                ret     = fn.apply(this, arguments)
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

        function fn() {
            if (this.initialize) {
                this.initialize.apply(this, arguments)
            }
        }

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
                    parentClass,
            c   = p ? extend(p, cls) : create(cls);

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
            throw new Error("Class " + cls + " not found");
        }

        c = new cls(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)

        c.__parent      = cls.__parent;
        c.__parentClass = cls.__parentClass;
        c.__class       = cls.__class;

        return c;
    };

}());
(function(){

    "use strict"

    MetaphorJs.define("MetaphorJs.cmp.Base", {

        initialize: function(cfg) {
            cfg     = cfg || {};
            MetaphorJs.apply(this, cfg);
        },

        destroy: MetaphorJs.emptyFn

    });

}());
/*!
 * MetaphorJs.lib.Observable 1.1
 * @author johann kuindji
 * @github https://github.com/kuindji/metaphorjs-observable
 */

(function(){

"use strict"


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

(function(){

    "use strict"

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

}());
(function(){

    "use strict"

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
