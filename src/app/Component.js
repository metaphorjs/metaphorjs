
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
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
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
     * @var string
     */
    id:             null,

    /**
     * @access private
     * @var bool
     */
    _originalId:    false,

    /**
     * @var Element
     * @access protected
     */
    node:           null,

    /**
     * @var boolean
     * @access private
     */
    _nodeReplaced:  false,

    /**
     * @var string|Element
     * @access protected
     */
    renderTo:       null,

    /**
     * @var {boolean}
     */
    autoRender:     false,

    /**
     * @var bool
     * @access protected
     */
    _rendered:       false,

    /**
     * @var bool
     * @access protected
     */
    destroyEl:      true,

    /**
     * @var {bool}
     */
    destroyScope:   false,

    /**
     * @var {Scope}
     */
    scope:          null,

    /**
     * @var {Template}
     */
    template:       null,

    /**
     * @var {object|bool}
     */
    supportsDirectives: false,

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

        var self    = this;

        cfg = cfg || {};

        self.$super(cfg);
        extend(self, cfg, true, false);

        if (!self.scope) {
            self.scope = new MetaphorJs.lib.Scope;
        }
        if (!self.config) {
            self.config = new MetaphorJs.lib.Config(null, {
                scope: self.parentScope || self.scope
            });
        }
        else if (!(self.config instanceof MetaphorJs.lib.Config)) {
            var cfgScope = self.config.scope;
            if (cfgScope) {
                delete self.config.scope;
            }
            self.config = new MetaphorJs.lib.Config(
                self.config, 
                {
                    scope: cfgScope || self.parentScope || self.scope
                }
            );
        }

        self.$refs = {node: {}, cmp: {}};
        self.scope.$cfg = {};
        self.config.setTo(self.scope.$cfg);
        self._initConfig();
        self.$callMixins("$initConfig");

        if (self.$view) {
            self.scope.$view = self.$view;
        }
        if (self.config.has("as")) {
            self.scope[self.config.get("as")] = self;
        }

        if (self.node) {
            var nodeId = MetaphorJs.dom.getAttr(self.node, "id");
            if (nodeId) {
                self._originalId = true;
                if (!self.id) {
                    self.id = nodeId;
                }
            }
        }

        self.id = self.id || "cmp-" + nextUid();

        if (!self.node && self.node !== false) {
            self.node = window.document.createElement(self.config.get("tag"));
        }

        self.beforeInitComponent.apply(self, arguments);
        self.initComponent.apply(self, arguments);

        if (self.scope.$app) {
            self.scope.$app.registerCmp(self, self.scope, "id");
        }

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self._onParentRendererDestroy, self);
        }

        if (self.node) {
            self._claimNode();
        }

        self._initTemplate();
    },

    _initTemplate: function() {

        var self = this,
            tpl = self.template;

        if (self.node) {
            self._nodeReplaced = htmlTags.indexOf(self.node.tagName.toLowerCase()) === -1;
        }

        if (tpl instanceof MetaphorJs.app.Template) {
            // it may have just been created
            self.template.node = self.node;
            self.template.on("reference", self._onChildReference, self);
            self.template.on("rendered", self._onRenderingFinished, self);
        }
        else {

            var tplConfig = self.config.slice(["animate"], {
                // component config's scope is from parent,
                // template's scope must be the same as component's
                scope: self.scope
            });
            MetaphorJs.app.Template.prepareConfig(tpl, tplConfig);
            self.template = tpl = new MetaphorJs.app.Template({
                scope: self.scope,
                node: self.node,
                deferRendering: self._nodeReplaced || !self.autoRender,
                ownRenderer: true,
                replace: self._nodeReplaced, // <some-custom-tag>
                config: tplConfig,
                callback: {
                    context: self,
                    reference: self._onChildReference,
                    rendered: self._onRenderingFinished,
                    "first-node": self._onFirstNodeReported
                }
            });
        }

        self.afterInitComponent.apply(self, arguments);

        if (self.autoRender) {
            tpl.childrenPromise.done(self.render, self);
        }
    },

    _initConfig: function() {
        var self = this,
            config = self.config,
            ctx;

        config.setDefaultMode("tag", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultValue("tag", "div");
        config.setDefaultMode("as", MetaphorJs.lib.Config.MODE_STATIC);

        if (self.as) {
            config.setDefaultValue("as", self.as);
        }

        config.setDefaultMode("callbackContext", MetaphorJs.lib.Config.MODE_SINGLE);
        config.eachProperty(function(name) {
            if (name.substring(0,4) === 'on--') {
                config.setMode(name, MetaphorJs.lib.Config.MODE_LISTENER);
                if (!ctx) {
                    if (self.scope.$app)
                        ctx = config.get("callbackContext") ||
                                self.scope.$app.getParentCmp(self.node) ||
                                self.scope.$app ||
                                self.scope;
                    else 
                        ctx = config.get("callbackContext") || self.scope;
                }
                self.on(name.substring(4), config.get(name), ctx);
            }
        });
    },

    _initDirectives: function() {
        var self = this,
            dirs = self.directives,
            support = self.supportsDirectives,
            dirCfg,
            config,
            handlers = MetaphorJs.app.Directive.getAttributes(),
            i, len, name,
            parentScope =   dirs.scope ||
                            self.parentScope ||
                            self.scope.$parent || 
                            self.config.getOption("scope") ||
                            self.scope;

        if (!support) {
            return;
        }

        for (i = 0, len = handlers.length; i < len; i++) {
            name    = handlers[i].name;

            if (name === "scope") {
                continue;
            }

            if (!(support === true || support[name])) {
                continue;
            }

            if ((dirCfg = dirs[name]) !== undf) {
                if (typeof dirCfg === "string") {
                    dirCfg = {
                        value: {
                            value: dirCfg
                        }
                    }
                }

                config = new MetaphorJs.lib.Config(
                    dirCfg, 
                    {scope: parentScope}
                );
                self.on("destroy", config.$destroy, config);
                MetaphorJs.app.Renderer.applyDirective(
                    handlers[i].handler, parentScope, self, config
                );
            }
        }
    },

    _onFirstNodeReported: function(node) {
        var self = this;
        if (self._nodeReplaced) {
            self._claimNode(node);
        }
        else if (!self.node) {
            self.node = node;
            self.template.node = node;
            self._claimNode(node);
        }
    },

    _onChildReference: function(type, ref, item) {
        var self = this;
        if (!self.$refs[type]) {
            self.$refs[type] = {};
        }

        var th = self.$refs[type][ref];
        self.$refs[type][ref] = item;

        if (th && isThenable(th)) {
            th.resolve(item);
        }
    },

    _claimNode: function(node) {
        var self = this;
        node = node || self.node;
        MetaphorJs.dom.setAttr(node, "cmp-id", self.id);
        if (!self._originalId) {
            MetaphorJs.dom.setAttr(node, "id", self.id);
        }
        node.$$cmpId = self.id;
    },

    _releaseNode: function(node) {
        node = node || this.node;
        MetaphorJs.dom.removeAttr(node, "cmp-id");
        if (!self._originalId) {
            MetaphorJs.dom.removeAttr(node, "id");
        }
        node.$$cmpId = null;
    },

    _replaceNodeWithTemplate: function() {
        var self = this;

        if (self._nodeReplaced && self.node && self.node.parentNode) {
            MetaphorJs.dom.removeAttr(self.node, "id");
        }

        self.node = self.template.node;

        // document fragment
        if (self.node.nodeType === 11 || isArray(self.node)) {
            var ch = self.node.nodeType === 11 ?
                    self.node.childNodes :
                    self.node,
                i, l;
            for (i = 0, l = ch.length; i < l; i++) {
                if (ch[i].nodeType === 1) {
                    self.node = ch[i];
                    break;
                }
            }
        }

        self.template.node = self.node;

        self._claimNode();
    },








    render: function(parent, before) {

        var self = this;

        if (parent && parent.nodeType === 8) {
            before = parent;
            parent = parent.parentNode;
        }

        if (self._rendered) {
            parent && self.attach(parent, before);
            return;
        }
        else if (parent) {
            self.renderTo = parent;
            self.renderBefore = before;
        }

        self.onBeforeRender();
        self.trigger('render', self);

        if (self.template) {
            self.template.startRendering();
        }
    },

    isAttached: function(parent) {
        if (!this.node || !this.node.parentNode) 
            return false;
        return parent ? this.node.parentNode === parent : true;
    },

    attach: function(parent, before) {
        var self = this;

        if (!parent) {
            throw new Error("Parent node is required");
        }
        if (self.isAttached(parent)) {
            return;
        }

        self.detach(true);
        self.renderTo = parent;
        self.renderBefore = before;

        
        if (self.template.moveTo(parent, before)) {
            self.afterAttached();
            self.trigger('attached', self);
        }
    },

    detach: function(willAttach) {
        var self = this;
        if (self.isAttached()) {
            self.node.parentNode.removeChild(self.node);
            self.afterDetached(willAttach);
            self.trigger('detached', self, willAttach);
        }
    },

    getRefEl: function(name) {
        return this.$refs['node'][name];
    },

    getRefCmp: function(name) {
        return this.$refs['cmp'][name];
    },

    getRefCmpPromise: function(name) {
        var cmp = this.$refs['cmp'][name];
        if (!cmp) {
            return this.$refs['cmp'][name] = new MetaphorJs.lib.Promise;
        }
        else if (isThenable(cmp)) {
            return cmp;
        }
        else {
            return MetaphorJs.lib.Promise.resolve(cmp);
        }
    },

    onBeforeRender: function() {
        this.config.getAll(); // calc all props and put into scope.$cfg
    },

    _onRenderingFinished: function() {
        var self = this;

        if ((self._nodeReplaced && self.node !== self.template.node) ||
            !self.node) {
            self._replaceNodeWithTemplate();
        }

        self._rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);

        if (self.node) {

            if (self.directives) {
                self._initDirectives();
            }

            if (MetaphorJs.dom.isAttached(self.node)) {
                self.afterAttached();
                self.trigger('after-attached', self);
            }
            else if (self.renderTo && self.node.parentNode !== self.renderTo) {
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
        var sup = this.supportsDirectives;
        if (!sup) {
            return null;
        }
        if (sup[directive] === true) {
            return this.node;
        }
        return this.$refs.node[sup[directive]];
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
    registerDirective: function(cmp) {
        if (typeof(cmp) === "string") {
            Directive.registerComponent(cmp);
        }
        else {
            Directive.registerComponent(cmp.prototype.$class, cmp);
        }
    }
});
