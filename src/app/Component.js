
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

var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
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
                scope: self.scope
            });
        }
        else if (!(self.config instanceof MetaphorJs.lib.Config)) {
            self.config = new MetaphorJs.lib.Config(
                self.config, 
                {
                    scope: self.scope
                }
            );
        }

        self.$refs = {node: {}, cmp: {}};
        self.$cfg = {};
        self.config.setTo(self.$cfg);
        self._initConfig();
        self.$callMixins("$initConfig");

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

        self._nodeReplaced = htmlTags.indexOf(self.node.tagName.toLowerCase()) === -1;
        
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
                    ctx = config.get("callbackContext") ||
                            self.scope.$app.getParentCmp(self.node) ||
                            self.scope.$app ||
                            self.scope;
                }
                self.on(name.substring(4), config.get(name), ctx);
            }
        });
    },

    _initDirectives: function() {
        var self = this,
            dirs = self.directives,
            attrProps,
            config,
            handlers = MetaphorJs.app.Directive.getAttributes(),
            i, len, name,
            parentScope = self.scope.$parent || 
                            self.config.getOption("scope") ||
                            self.scope;

        for (i = 0, len = handlers.length; i < len; i++) {
            name    = handlers[i].name;

            if ((attrProps = dirs[name]) !== undf) {
                config = new MetaphorJs.lib.Config(
                    attrProps.config, 
                    {
                        scope: parentScope
                    }
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
    },

    _onChildReference: function(type, ref, item) {
        var self = this;
        if (!self.$refs[type]) {
            self.$refs[type] = {};
        }
        self.$refs[type][ref] = item;
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

        if (self._nodeReplaced && self.node.parentNode) {
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

        self._claimNode();
    },








    render: function(parent) {

        var self = this;

        if (self._rendered) {
            parent && self.attach(parent);
            return;
        }
        else parent && (self.renderTo = parent);
        
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

    attach: function(parent) {
        var self = this;

        if (!parent) {
            throw new Error("Parent node is required");
        }
        if (self.isAttached(parent)) {
            return;
        }

        self.detach(true);
        self.renderTo = parent;

        if (self.template.moveTo(parent)) {
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

        if (self.directives) {
            self._initDirectives();
        }

        if (MetaphorJs.dom.isAttached(self.node)) {
            self.afterAttached();
            self.trigger('after-attached', self);
        }
        else if (self.renderTo && self.node.parentNode !== self.renderTo) {
            self.attach(self.renderTo);
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
        return this.node;
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

        if (self.destroyEl) {
            if (self.node && MetaphorJs.dom.isAttached(self.node)) {
                self.node.parentNode.removeChild(self.node);
            }
        }
        else if (self.node) {

            if (!self._originalId) {
                MetaphorJs.dom.removeAttr(self.node, "id");
            }

            self._releaseNode();
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
