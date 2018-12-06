
require("../func/dom/getAttr.js");
require("../func/dom/setAttr.js");
require("../func/dom/removeAttr.js");
require("../func/dom/isAttached.js");
require("./Template.js");
require("./Directive.js");
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

    _originalId:     false,

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
    autoRender:     true,

    /**
     * @var bool
     * @access protected
     */
    _rendered:       false,

    /*
     * @var bool
     * @access protected
     */
    //hidden:         false,

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
     * @var string
     */
    templateUrl:    null,


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
            self._createNode();
        }

        self.beforeInitComponent.apply(self, arguments);
        self.initComponent.apply(self, arguments);

        if (self.scope.$app){
            self.scope.$app.registerCmp(self, self.scope, "id");
        }

        var tpl = self.template,
            url = self.templateUrl;

        self._nodeReplaced = htmlTags.indexOf(self.node.tagName.toLowerCase()) === -1;

        if (!tpl || !(tpl instanceof MetaphorJs.app.Template)) {
            self.template = tpl = new MetaphorJs.app.Template({
                scope: self.scope,
                node: self.node,
                deferRendering: !tpl || self._nodeReplaced,
                ownRenderer: true,
                replace: self._nodeReplaced,
                tpl: tpl,
                url: url,
                shadow: self.constructor.$shadow,
                animate: !self.hidden && !!self.animate//,
                //passAttrs: self.passAttrs
            });

            self.template.on("first-node", self._onFirstNodeReported, self);
        }
        else if (tpl instanceof MetaphorJs.app.Template) {
            // it may have just been created
            self.template.node = self.node;
        }

        self.afterInitComponent.apply(self, arguments);

        self.template.on("rendered", self._onRenderingFinished, self);

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self._onParentRendererDestroy, self);
        }

        if (self.node) {
            self._initElement();
        }

        if (self.autoRender) {

            if (tpl.initPromise) {
                tpl.initPromise.done(self.render, self);
            }
            else {
                self.render();
            }
        }
    },

    _initConfig: function() {
        var self = this,
            config = self.config,
            ctx;

        config.setDefaultMode("tag", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultValue("tag", "div");
        config.setDefaultMode("as", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultMode("callbackContext", MetaphorJs.lib.Config.MODE_SINGLE);
        config.eachProperty(function(name) {
            if (name.substring(0,4) === 'on--') {
                config.setMode(name, MetaphorJs.lib.Config.MODE_LISTENER);
                if (!ctx) {
                    ctx = config.get("callbackContext") ||
                            self.scope.$app.getParentCmp(self.node) ||
                            self.scope.$app ||
                            self.scope;
                    self.on(name.substring(4), config.get(name), ctx);
                }
            }
        });
    },

    _createNode: function() {
        var self    = this;
        self.node   = window.document.createElement(self.config.get("tag"));
    },

    _initElement: function() {

        var self    = this,
            node    = self.node;

        if (!self._originalId) {
            MetaphorJs.dom.setAttr(node, "id", self.id);
        }

        self._initNode();
    },

    _releaseNode: function() {
        var self = this,
            node = self.node;
        MetaphorJs.dom.removeAttr(node, "cmp-id");
    },

    _onFirstNodeReported: function(node) {
        var self = this;
        if (self._nodeReplaced) {
            MetaphorJs.dom.setAttr(node, "cmp-id", self.id);
            node.$$cmpId = self.id;
        }
    },

    _initNode: function() {

        var self = this,
            node = self.node;

        MetaphorJs.dom.setAttr(node, "cmp-id", self.id);
        node.$$cmpId = self.id;
    },

    _replaceNodeWithTemplate: function() {
        var self = this;

        if (self._nodeReplaced && self.node.parentNode) {
            MetaphorJs.dom.removeAttr(self.node, "id");
            //self.node.parentNode.removeChild(self.node);
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

        self._initElement();
    },

    render: function() {

        var self        = this;

        if (self._rendered) {
            return;
        }

        if ((self._nodeReplaced && self.node !== self.template.node) ||
            !self.node) {
            self._replaceNodeWithTemplate();
        }

        self.onBeforeRender();
        self.trigger('render', self);
        self.template.startRendering();
    },

    onBeforeRender: function() {
        this.config.getAll(); // calc all props and put into scope.cfg
    },

    _onRenderingFinished: function() {
        var self = this;

        if ((self._nodeReplaced && self.node !== self.template.node) ||
            !self.node) {
            self._replaceNodeWithTemplate();
        }

        if (self.renderTo) {
            self.renderTo.appendChild(self.node);
        }
        else if (!isAttached(self.node)) {
            window.document.body.appendChild(self.node);
        }

        self._rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);
    },


    /*
     * @access public
     * @method
     */
    /*show: function() {
        var self    = this;
        if (!self.hidden) {
            return;
        }
        if (self.trigger('before-show', self) === false) {
            return false;
        }

        if (!self.rendered) {
            self.render();
        }

        self.template.setAnimation(true);
        self.showApply();

        self.hidden = false;
        self.onShow();
        self.trigger("show", self);
    },

    showApply: function() {
        var self = this;
        if (self.node) {
            self.node.style.display = "block";
        }
    },*/

    /*
     * @access public
     * @method
     */
    /*hide: function() {
        var self    = this;
        if (self.hidden) {
            return;
        }
        if (self.trigger('before-hide', self) === false) {
            return false;
        }

        self.template.setAnimation(false);
        self.hideApply();

        self.hidden = true;
        self.onHide();
        self.trigger("hide", self);
    },

    hideApply: function() {
        var self = this;
        if (self.node) {
            self.node.style.display = "none";
        }
    },*/

    freezeByView: function(view) {
        var self = this;
        self._releaseNode();
        self.scope.$freeze();
        self.trigger("view-freeze", self, view);

    },

    unfreezeByView: function(view) {
        var self = this;
        self._initNode();
        self.scope.$unfreeze();
        self.trigger("view-unfreeze", self, view);
        self.scope.$check();
    },

    /*
     * @access public
     * @return bool
     */
    //isHidden: function() {
    //    return this.hidden;
    //},

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

    /*
     * @method
     * @access protected
     */
    //onShow:         emptyFn,

    /*
     * @method
     * @access protected
     */
    //onHide:         emptyFn,

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
