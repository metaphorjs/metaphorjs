

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
     * @var {MetaphorJs.lib.Config}
     */
    config:         null,



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
        self._initConfig(config);
        self.$callMixins("$initConfig", config);

        if (config.has("init")) {
            config.get("init")(scope);
        }
        if (config.has("as")) {
            scope[config.get("as")] = self;
        }

        self.id = config.has("id") ? config.get("id") : "ctrl-" + nextUid();

        self._initController.apply(self, arguments);

        if (scope.$app) {
            scope.$app.registerCmp(self, scope, "id");
        }

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self._onParentRendererDestroy, self);
        }

        self._claimNode();
    },

    _initConfig: function() {
        var self = this,
            scope = self.scope,
            config = self.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC,
            msl = MetaphorJs.lib.Config.MODE_LISTENER,
            ctx;

        config.setMode("scope", mst);
        config.setMode("init", MetaphorJs.lib.Config.MODE_FUNC);
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

    _claimNode: function() {
        var self = this;
        self.node.$$ctrlId = self.id;
    },

    _releaseNode: function(node) {
        this.node.$$ctrlId = null;
    },


    /**
     * @access public
     * @return bool
     */
    isDestroyed: function() {
        return this.$$destroyed;
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
    _initController:  emptyFn,

    
    _onParentRendererDestroy: function() {
        this.$destroy();
    },

    onDestroy:      function() {

        var self    = this;

        self._releaseNode();
        self.config.$destroy();
        self.$super();
    }

});
