

require("../lib/State.js");
require("../lib/Config.js");
require("metaphorjs-observable/src/mixin/Observable.js");

const cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js");

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
     * @var {MetaphorJs.lib.State}
     */
    state:          null,

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
    destroyState:   false,


    __nodeId:       "$$ctrlId",
    __idPfx:        "ctrl-",
    __initInstance: "initController",


    /**
     * @constructor
     * @param {object} cfg
     */
    $init: function(cfg) {

        let self    = this,
            state,
            config;

        cfg = cfg || {};

        self._protoCfg = cfg.config;
        self.config = null;
        self.$super(cfg);
        extend(self, cfg, true, false);

        if (!self.state || (typeof(self.state) === "string" && 
                            self.state.indexOf(":new") !== -1)) {
            self.destroyState = true;
        }
        state = self.state = MetaphorJs.lib.State.$produce(self.state);

        // We initialize config with current state or change config's state
        // to current so that all new properties that come from initConfig
        // are bound to local state. 
        // All pre-existing properties are already bound to outer state;
        // Also, each property configuration can have its own state specified
        config = self.config = MetaphorJs.lib.Config.create(
            self.config,
            { state }, 
            /*scalarAs: */"defaultValue"
        )
        config.setOption("state", state);
        state.$cfg = {};
        config.setTo(state.$cfg);
        self.initConfig();
        self.$callMixins("$initConfig", config);

        if (self._protoCfg) {
            config.addProperties(
                self._protoCfg, 
                /*scalarAs:*/ "defaultValue"
            );
        }

        self.id = config.get("id");
        self.$refs = {node: {}, cmp: {}};
        if (self.node) {
            self.$refs.node.main = self.node;
        }

        if (config.has("init")) {
            config.get("init")(state);
        }
        if (config.has("as")) {
            state[config.get("as")] = self;
        }

        self[self.__initInstance].apply(self, arguments);

        if (state.$app) {
            state.$app.registerCmp(self, "id");
        }

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self._onParentRendererDestroy, self);
        }

        self._claimNode();
    },

    initConfig: function() {
        var self = this,
            state = self.state,
            config = self.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("id", "string", mst, self.id || self.__idPfx + nextUid())
        self.$self.initConfig(config);

        if (self.as) {
            config.setDefaultValue("as", self.as);
        }

        MetaphorJs.lib.Observable.$initHostConfig(self, config, state, self.node);
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

        if (this.destroyState && this.state) {
            this.state.$destroy();
        }

        this._releaseNode();
        this.config.$destroy();
        this.$super();
    }

}, {
    initConfig: function(config) {
        const mst = MetaphorJs.lib.Config.MODE_STATIC;
        config.setMode("init", MetaphorJs.lib.Config.MODE_FUNC);
        config.setDefaultMode("as", mst);
        config.setDefaultMode("state", mst);
    }
});
