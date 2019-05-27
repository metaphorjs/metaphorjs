
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
require("./Controller.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    htmlTags = require("../var/dom/htmlTags");

/**
 * @class MetaphorJs.app.Component
 */
module.exports = MetaphorJs.app.Component = MetaphorJs.app.Controller.$extend({

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
     * @var {Template}
     */
    template:       null,


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
    _rendered:      false,

    /**
     * @var {bool}
     * @access protected
     */
    _attached:      false,


    __nodeId:       "$$cmpId",
    __idPfx:        "cmp-",
    __initInstance: "_initComponent",


    $constructor: function(cfg) {
        var self = this,
            viewCls = self.$view || (cfg ? cfg.$view : null);

        // see MetaphorJs.app.component.View
        viewCls && self.$plugins.push(viewCls);
        self.$super();
    },

    /**
     * @constructor
     * @param {object} cfg
     */
    $init: function() {

        var self    = this;
        self.$super.apply(self, arguments);

        self.config.getAll(); // calc all values into $cfg
        self._initTemplate();

        self.afterInitComponent.apply(self, arguments);

        if (self.autoRender) {
            self.template.resolve()
                .done(self.template.render, self.template)
                .done(self.render, self);
        }
    },

    // this gets called inside parent's $init
    _initComponent: function() {
        var self = this;

        if (self.$view) {   
            self.scope.$view = self.$view;
        }

        self.initComponent.apply(self, arguments);
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
                rendered: self._onRenderingFinished,
                attached: self._onTemplateAttached
            }
        });

        if (self._nodeCreated) {
            self.template.setNamedNode("main", self.node);
        }
    },

    _initTplConfig: function(config) {},

    initConfig: function() {
        var self = this;
        self.$super();
        self.$self.initConfig(self.config);
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
            ds,
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

        self.$super.apply(self, arguments);
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

    detach: function() {
        var self = this;
        if (self.template.isAttached()) {
            self.template.detach();
        }
    },

    onBeforeRender: function() {
    },

    _onRenderingFinished: function() {
        var self = this;

        self._rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);

        console.log("rendering finished")

        if (self.renderTo) {
            console.log("render to")
            self.template.attach(self.renderTo, self.renderBefore);
            console.log("attached")
        }

        if (self.directives) {
            console.log("directives 1")
            self._initDirectives();
            console.log("directives 2")
        }
    },


    _onTemplateAttached: function() {
        console.log("template attached")
        this._attached = true;
        this.afterAttached();
        this.trigger('after-attached', this);
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
        return this.$destroyed;
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
                self._releaseNode();
            }
        }

        self.$super();
    }

}, {

    initConfig: function(config) {
        var mst = MetaphorJs.lib.Config.MODE_STATIC;
        config.setType("makeTranscludes", "bool", mst, false);
        config.setType("useShadow", "bool", mst, false);
        config.setDefaultMode("tag", mst);
    },

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
