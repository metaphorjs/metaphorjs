
require("../func/dom/getAttr.js");
require("../func/dom/setAttr.js");
require("../func/dom/removeAttr.js");
require("../func/dom/isAttached.js");
require("./Template.js");
require("./Directive.js");
require("./Renderer.js");
require("../func/dom/addClass.js");
require("../func/dom/removeClass.js");
require("../lib/Scope.js");
require("../lib/Config.js");
require("metaphorjs-observable/src/mixin/Observable.js");
require("metaphorjs-promise/src/lib/Promise.js");

var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    htmlTags = require("../var/dom/htmlTags");

/**
 * @class MetaphorJs.app.Component
 */
module.exports = MetaphorJs.app.Component = cls({

    $mixins: [MetaphorJs.mixin.Observable],
    $mixinEvents: ["$initConfig"],

    /**
     * @access protected
     * @var {string}
     */
    id:             null,

    /**
     * @var {HtmlElement}
     * @access protected
     */
    node:           null,

    /**
     * @var {boolean}
     * @access protected
     */
    useShadowDOM:   false,

    /**
     * @var {boolean}
     * @access protected
     */
    replaceCustomNode: true,

    /**
     * @var {string|HtmlElement}
     * @access protected
     */
    renderTo:       null,

    /**
     * @var {boolean}
     */
    autoRender:     false,

    /**
     * @var {boolean}
     */
    autoAttach:     false,

    /**
     * @var {bool}
     * @access protected
     */
    destroyEl:      true,

    /**
     * @var {bool}
     */
    destroyScope:   false,

    /**
     * @var {MetaphorJs.lib.Scope}
     */
    scope:          null,

    /**
     * @var {MetaphorJs.lib.Config}
     */
    config:         null,

    /**
     * @var {Template}
     */
    template:       null,



    /**
     * @access private
     * @var {boolean}
     */
    _originalId:    false,

    /**
     * @var {boolean}
     * @access private
     */
    _nodeReplaced:  false,

    /**
     * @var {boolean}
     * @access private
     */
    _nodeCreated:   false,

    /**
     * @var {bool}
     * @access protected
     */
    _rendered:       false,


    $constructor: function(cfg) {
        var self = this,
            viewCls = self.$view || (cfg ? cfg.$view : null);

        viewCls && self.$plugins.push(viewCls);
        self.$super();
    },

    /**
     * @constructor
     * @param {object} cfg {
     *      @type string id Element id
     *      @type string|Element el
     *      @type string|Element renderTo
     *      @type bool hidden
     *      @type bool destroyEl
     * }
     */
    $init: function(cfg) {

        var self    = this,
            scope,
            config;

        cfg = cfg || {};

        self._protoCfg = self.config;
        self.$super(cfg);
        extend(self, cfg, true, false);

        scope = self.scope = MetaphorJs.lib.Scope.$produce(self.scope);

        // We initialize config with current scope or change config's scope
        // to current so that all new properties that come from _initConfig
        // are bound to local scope. 
        // All pre-existing properties are already bound to outer scope;
        // Also, each property configuration can have its scope specified
        config = self.config = MetaphorJs.lib.Config.create(
            self.config,
            {scope: scope}, 
            /*scalarAs: */"defaultValue"
        )
        config.setOption("scope", scope);

        self.$refs = {node: {}, cmp: {}};
        scope.$cfg = {};
        config.setTo(scope.$cfg);
        self._initConfig(config);
        self.$callMixins("$initConfig", config);

        if (config.has("init")) {
            config.get("init")(scope);
        }

        if (self.$view) {
            scope.$view = self.$view;
        }
        if (config.has("as")) {
            scope[config.get("as")] = self;
        }

        if (self.node) {
            var nodeId = MetaphorJs.dom.getAttr(self.node, "id");
            if (nodeId) {
                self._originalId = true;
                if (!self.id) {
                    self.id = nodeId;
                }
            }
            self.$refs.node.main = self.node;
        }

        self.id = self.id || "cmp-" + nextUid();

        self.beforeInitComponent.apply(self, arguments);
        self.initComponent.apply(self, arguments);

        if (scope.$app) {
            scope.$app.registerCmp(self, scope, "id");
        }

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self._onParentRendererDestroy, self);
        }

        if (self.node) {
            self._claimNode();
        }

        self.config.getAll();
        self._initTemplate();
    },

    _initTemplate: function() {

        var self = this,
            tpl = self.template,
            rootNode = null,
            replaceNode = null,
            attachTo = null,
            config = self.config;

        if (self.node) {
            self._nodeReplaced = self.replaceCustomNode && 
                                    htmlTags.indexOf(
                                        self.node.tagName.toLowerCase()
                                    ) === -1;
            if (self._nodeReplaced) {
                replaceNode = self.node;
                self.node = null;
                self.$refs.node.main = null;
            }
            else {
                attachTo = self.node;
            }
        }

        if (!self.node && config.has("tag")) {
            rootNode = window.document.createElement(config.get("tag"));
            self.node = rootNode;
            self.$refs.node.main = rootNode;
            self._nodeCreated = true;
            if (self._nodeReplaced && replaceNode.parentNode) {
                replaceNode.parentNode.replaceChild(replaceNode, rootNode);
                rootNode = null;
                attachTo = self.node;
            }
        }

        var tplConfig = new MetaphorJs.lib.Config({
            deferRendering: true,
            runRenderer: true,
            useShadow: config.copyProperty("useShadow"),
            makeTranscludes: config.copyProperty("makeTranscludes")
        }, {scope: self.scope});

        attachTo && tplConfig.setStatic("useComments", false);
        MetaphorJs.app.Template.prepareConfig(tplConfig, tpl);

        self._initTplConfig(tplConfig);

        self.template = tpl = new MetaphorJs.app.Template({
            scope: self.scope,
            config: tplConfig,

            rootNode: rootNode,
            attachTo: attachTo,
            replaceNode: replaceNode,

            callback: {
                context: self,
                reference: self._onChildReference,
                rendered: self._onRenderingFinished
            }
        });

        if (self._nodeCreated) {
            self.template.setNamedNode("main", self.node);
        }

        self.afterInitComponent.apply(self, arguments);

        if (self.autoRender) {
            tpl.resolve()
                .done(tpl.render, tpl)
                .done(self.render, self);
        }
    },

    _initTplConfig: function(config) {},

    _initConfig: function() {
        var self = this,
            scope = self.scope,
            config = self.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC,
            msl = MetaphorJs.lib.Config.MODE_LISTENER,
            ctx;

        config.setType("makeTranscludes", "bool", mst, false);
        config.setType("useShadow", "bool", mst, false);
        config.setMode("scope", mst);
        config.setMode("init", MetaphorJs.lib.Config.MODE_FUNC);
        config.setDefaultMode("tag", mst);
        config.setDefaultMode("as", mst);

        if (self.as) {
            config.setDefaultValue("as", self.as);
        }

        config.setDefaultMode("callbackContext", MetaphorJs.lib.Config.MODE_SINGLE);
        config.eachProperty(function(name) {
            if (name.substring(0,4) === 'on--') {
                config.setMode(name, msl);
                if (!ctx) {
                    if (scope.$app)
                        ctx = config.get("callbackContext") ||
                                scope.$app.getParentCmp(self.node) ||
                                scope.$app ||
                                scope;
                    else 
                        ctx = config.get("callbackContext") || scope;
                }
                self.on(name.substring(4), config.get(name), ctx);
            }
        });

        if (self._protoCfg) {
            config.addProperties(
                self._protoCfg, 
                /*scalarAs: */"defaultValue"
            );
        }
    },

    hasDirective: function(name) {
        return this.directives && !!this.directives[name];
    },

    applyDirective: function(name, cfg) {
        var self = this,
            support = self.$self.supportsDirectives,
            dir;

        if (!support) {
            return;
        }
        if (support !== true && !support[name]) {
            return;
        }

        if (self._rendered) {
            dir = MetaphorJs.app.Directive.getDirective("attr", name);
            if (dir) {
                MetaphorJs.app.Renderer.applyDirective(
                    dir.handler, 
                    self._getDirectiveScope(), 
                    self, 
                    self._prepareDirectiveCfg(dirCfg)
                );
            }
            else {
                throw new Error("Directive " + name + " not found");
            }
        }
        else {
            if (!self.directives) {
                self.directives = {};
            }
            if (!self.directives[name]) {
                self.directives[name] = [cfg];
            }
            else {
                self.directives[name].push(cfg);
            }
        }
    },

    _getDirectiveScope: function() {
        var self = this,
            dirs = self.directives || {};
        return  dirs.scope ||
                self.parentScope ||
                self.scope.$parent || 
                self.config.getOption("scope") ||
                self.scope;
    },

    _prepareDirectiveCfg: function(cfg) {

        if (cfg instanceof MetaphorJs.lib.Config) {
            return cfg;
        }

        var self = this,
            config;

        if (typeof cfg === "string") {
            cfg = {
                value: {
                    value: cfg
                }
            }
        }

        config = new MetaphorJs.lib.Config(
            cfg, 
            {scope: self._getDirectiveScope()}
        );
        self.on("destroy", config.$destroy, config);
        return config;
    },

    _initDirectives: function() {
        var self = this,
            dirs = self.directives,
            support = self.$self.supportsDirectives,
            dirCfg, ds,
            handlers = MetaphorJs.app.Directive.getAttributes(),
            i, len, name,
            j, jlen;

        if (!support) {
            return;
        }

        for (i = 0, len = handlers.length; i < len; i++) {
            name    = handlers[i].name;

            if (!(support === true || support[name])) {
                continue;
            }

            if ((ds = dirs[name]) !== undf) {

                !isArray(ds) && (ds = [ds]);

                for (j = 0, jlen = ds.length; j < jlen; j++) {

                    MetaphorJs.app.Renderer.applyDirective(
                        handlers[i].handler, 
                        self._getDirectiveScope(), 
                        self, 
                        self._prepareDirectiveCfg(ds[j])
                    );
                }
            }
        }
    },

    _onChildReference: function(type, ref, item) {
        var self = this;

        if (!self.$refs[type]) {
            self.$refs[type] = {};
        }

        var th = self.$refs[type][ref];

        // change comment's reference name so
        // that it won't get referenced twice
        if (item) {
            if (item.nodeType && 
                item.nodeType === window.document.COMMENT_NODE) {
                item.textContent = "*" + self.id + "*" + ref + "*";
            }
            else {
                if (!self.node && type === "node" && ref === "main") {
                    self.node = item;
                    self._claimNode();
                }
                if (self.template instanceof MetaphorJs.app.Template) {
                    self.template.setNamedNode(ref, item);
                }
            }
        }    

        if (!th) {
            self.$refs[type][ref] = item;
        }
        if (isThenable(th)) {
            th.resolve(item);
        }
    },

    _claimNode: function(node) {
        var self = this;
        node = node || self.node;
        if (!self._originalId) {
            MetaphorJs.dom.setAttr(node, "id", self.id);
        }
        node.$$cmpId = self.id;
    },

    _releaseNode: function(node) {
        node = node || this.node;
        if (!self._originalId) {
            MetaphorJs.dom.removeAttr(node, "id");
        }
        node.$$cmpId = null;
    },









    render: function(parent, before) {

        var self = this;

        if (parent && parent.nodeType === window.document.COMMENT_NODE) {
            before = parent;
            parent = parent.parentNode;
        }

        if (self._rendered) {
            parent && self.attach(parent, before);
        }
        else if (parent) {
            self.renderTo = parent;
            self.renderBefore = before;
        }

        self.onBeforeRender();
        self.trigger('render', self);

        if (self.template) {
            self.template.render();
        }
    },

    isAttached: function(parent) {
        return this.template.isAttached(parent);
    },

    attach: function(parent, before) {
        var self = this;

        if (!parent) {
            throw new Error("Parent node is required");
        }

        self.template.attach(parent, before);
    },

    detach: function(willAttach) {
        var self = this;
        if (self.template.isAttached()) {
            self.template.detach();
        }
    },

    getRefEl: function(name) {
        return this.$refs['node'][name];
    },

    getRefCmp: function(name) {
        return this.$refs['cmp'][name];
    },


    _getRefPromise: function(type, name) {
        var ref = this.$refs[type][name];
        if (!ref) {
            return this.$refs[type][name] = new MetaphorJs.lib.Promise;
        }
        else if (isThenable(ref)) {
            return ref;
        }
        else {
            return MetaphorJs.lib.Promise.resolve(ref);
        }
    },

    getRefElPromise: function(name) {
        return this._getRefPromise("node", name);
    },

    getRefCmpPromise: function(name) {
        return this._getRefPromise("cmp", name);
    },

    onBeforeRender: function() {
    },

    _onRenderingFinished: function() {
        var self = this;

        self._rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);

        if (self.directives) {
            self._initDirectives();
        }

        if (self.node) {

            if (MetaphorJs.dom.isAttached(self.node)) {
                self.afterAttached();
                self.trigger('after-attached', self);
            }
            else if (self.renderTo && self.node.parentNode !== self.renderTo) {
                self.attach(self.renderTo, self.renderBefore);
            }
        }
        else {
            if (self.renderTo) {
                self.attach(self.renderTo, self.renderBefore);
            }
        }
    },






    freeze: function() {
        var self = this;
        self._releaseNode();
        self.scope.$freeze();
        self.trigger("freeze", self);
    },

    unfreeze: function() {
        var self = this;
        self._claimNode();
        self.scope.$unfreeze();
        self.trigger("unfreeze", self);
        self.scope.$check();
    },






    /**
     * @access public
     * @return bool
     */
    isRendered: function() {
        return this._rendered;
    },

    /**
     * @access public
     * @return bool
     */
    isDestroyed: function() {
        return this.destroyed;
    },

    /**
     * @access public
     * @return Element
     */
    getEl: function() {
        return this.node;
    },

    /**
     * Returns api (in a simplest case - dom element) 
     * for directive to work with
     * @param {string} directive 
     */
    getDomApi: function(directive) {
        var sup = this.$self.supportsDirectives;
        if (!sup || !sup[directive]) {
            return null;
        }
        var ref = sup[directive] === true ? "main" : sup[directive];
        return this.getRefEl(ref) || this.getRefElPromise(ref);
    },

    getInputApi: function() {
        return null;
    },

    getApi: function(type, directive) {
        if (type === "node") {
            return this.getDomApi(directive);
        }
        else if (type === "input") {
            return this.getInputApi();
        }
    },

    /**
     * @method
     * @access protected
     */
    beforeInitComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    initComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterInitComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterRender:    emptyFn,

    /**
     * @method
     * @access protected
     */
    afterAttached:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterDetached:  emptyFn,


    
    _onParentRendererDestroy: function() {
        this.$destroy();
    },

    onDestroy:      function() {

        var self    = this;

        if (self.template) {
            self.template.$destroy();
        }

        if (self.node) {
            if (self.destroyEl) {
                if (MetaphorJs.dom.isAttached(self.node)) {
                    self.node.parentNode.removeChild(self.node);
                }
            }
            else {
                if (!self._originalId) {
                    MetaphorJs.dom.removeAttr(self.node, "id");
                }

                self._releaseNode();
            }
        }

        self.config.$destroy();

        if (self.destroyScope && self.scope) {
            self.scope.$destroy();
        }

        self.$super();
    }

}, {

    registerWebComponent: function(tagName) {
        var cls = this;
        Directive.registerComponent(tagName, cls);
        return MetaphorJs.dom.webComponentWrapper(tagName, cls);
    },

    registerDirective: function(cmp) {
        if (typeof(cmp) === "string") {
            Directive.registerComponent(cmp);
        }
        else {
            Directive.registerComponent(cmp.prototype.$class, cmp);
        }
    },


    /**
     * @static
     * @var {object|bool}
     */
    supportsDirectives: false,

    configProps: [],

    createFromPlainObject: function(obj) {

        if (obj instanceof this) {
            return obj;
        }

        if (!obj.config) {
            var config = {},
                props = this.configProps,
                i, l, name;

            obj.config = config;

            for (i = 0, l = props.length; i < l; i++) {
                name = props[i];
                if (obj[name]) {
                    config[name] = obj[name];
                    delete obj[name];
                }
            }
        }

        return new this(obj);
    }
});
