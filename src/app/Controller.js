

require("../lib/Scope.js");
require("../lib/Config.js");
require("metaphorjs-observable/src/mixin/Observable.js");

var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");

/**
 * @class MetaphorJs.app.Controller
 */
module.exports = MetaphorJs.app.Controller = cls({

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
     * @var {MetaphorJs.lib.Scope}
     */
    scope:          null,

    /**
     * @var {MetaphorJs.app.Renderer}
     */
    parentRenderer: null,

    /**
     * @var {MetaphorJs.lib.Config}
     */
    config:         null,

    /**
     * @var {bool}
     */
    destroyScope:   false,


    __nodeId:       "$$ctrlId",
    __idPfx:        "ctrl-",
    __initInstance: "initController",


    /**
     * @constructor
     * @param {object} cfg
     */
    $init: function(cfg) {

        var self    = this,
            scope,
            config;

        cfg = cfg || {};

        self._protoCfg = self.config;
        self.config = null;
        self.$super(cfg);
        extend(self, cfg, true, false);

        if (!self.scope || (typeof(self.scope) === "string" && 
                            self.scope.indexOf(":new") !== -1)) {
            self.destroyScope = true;
        }
        scope = self.scope = MetaphorJs.lib.Scope.$produce(self.scope);

        // We initialize config with current scope or change config's scope
        // to current so that all new properties that come from initConfig
        // are bound to local scope. 
        // All pre-existing properties are already bound to outer scope;
        // Also, each property configuration can have its own scope specified
        config = self.config = MetaphorJs.lib.Config.create(
            self.config,
            {scope: scope}, 
            /*scalarAs: */"defaultValue"
        )
        config.setOption("scope", scope);
        scope.$cfg = {};
        config.setTo(scope.$cfg);
        self.initConfig();
        self.$callMixins("$initConfig", config);
        if (self._protoCfg) {
            config.addProperties(
                self._protoCfg, 
                /*scalarAs: */"defaultValue"
            );
        }

        self.id = config.get("id");
        self.$refs = {node: {}, cmp: {}};
        if (self.node) {
            self.$refs.node.main = self.node;
        }

        if (config.has("init")) {
            config.get("init")(scope);
        }
        if (config.has("as")) {
            scope[config.get("as")] = self;
        }        

        self[self.__initInstance].apply(self, arguments);

        if (scope.$app) {
            scope.$app.registerCmp(self, "id");
        }

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self._onParentRendererDestroy, self);
        }

        self._claimNode();
    },

    initConfig: function() {
        var self = this,
            scope = self.scope,
            config = self.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC,
            msl = MetaphorJs.lib.Config.MODE_LISTENER,
            ctx;

        config.setType("id", "string", mst, self.id || self.__idPfx + nextUid())
        config.setMode("init", MetaphorJs.lib.Config.MODE_FUNC);
        config.setDefaultMode("as", mst);
        config.setDefaultMode("scope", mst);

        if (self.as) {
            config.setDefaultValue("as", self.as);
        }

        MetaphorJs.lib.Observable.$initHostConfig(self, config, scope, self.node);
    },

    _claimNode: function() {
        var self = this;
        self.node && (self.node[self.__nodeId] = self.id);
    },

    _releaseNode: function() {
        var self = this;
        self.node && (self.node[self.__nodeId] = null);
    },

    _onChildReference: function(type, ref, item) {
        var self = this;

        if (!self.$refs[type]) {
            self.$refs[type] = {};
        }

        var th = self.$refs[type][ref];

        if (!th) {
            self.$refs[type][ref] = item;
        }
        if (isThenable(th)) {
            th.resolve(item);
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

    /**
     * @access public
     * @return Element
     */
    getEl: function() {
        return this.node;
    },


    /**
     * @access public
     * @return bool
     */
    isDestroyed: function() {
        return this.$$destroyed;
    },

    /**
     * @method
     * @access protected
     */
    initController:  emptyFn,

    
    _onParentRendererDestroy: function() {
        this.$destroy();
    },

    onDestroy:      function() {

        var self    = this;

        if (self.destroyScope && self.scope) {
            self.scope.$destroy();
        }

        self._releaseNode();
        self.config.$destroy();
        self.$super();
    }

});
