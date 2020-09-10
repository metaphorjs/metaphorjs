
require("./__init.js");
require("./Component.js");
require("./Template.js");
require("./Renderer.js");
require("../func/app/resolve.js");
require("../func/dom/getAttrSet.js");
require("../func/dom/is.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

module.exports = MetaphorJs.app.Container = MetaphorJs.app.Component.$extend({

    $mixinEvents: ["$initChildItem"],
    _itemsInitialized: false,
    defaultAddTo: "main",

    _initComponent: function() {
        var self = this;

        self.$super.apply(self, arguments);

        if (self.node && self.template && self.node.firstChild) {
            self._prepareDeclaredItems(toArray(self.node.childNodes));
        }

        self._initItems();
    },

    _initTplConfig: function(tplConfig) {
        tplConfig.setStatic("makeTranscludes", false);
        tplConfig.setFinal("makeTranscludes");
    },

    _prepareDeclaredItems: function(nodes) {

        var self = this,
            i, l, node, renderer,
            found = false,
            idkey = self._getIdKey(),
            renderRef, attrSet,
            foundCmp, foundPromise,
            state = self.state,
            items = self.items || [],
            def,

            refCallback = function(type, ref, cmp, cfg, attrSet){
                if (cfg.node === node) {
                    foundCmp = cmp;
                    renderRef = attrSet.at;
                }
            },

            promiseCallback = function(promise, cmpName, cfg, attrSet){
                if (cfg.node === node) {
                    foundPromise = promise;
                    renderRef = attrSet.at;
                }
            };

        if (!self._itemsInitialized && isArray(items)) {
            items = {
                body: items
            }
        }

        for (i = 0, l = nodes.length; i < l; i++) {
            node = nodes[i];

            if (!node) {
                continue;
            }

            def = null;
            if (node.nodeType === window.document.ELEMENT_NODE) {

                if (node[idkey]) {
                    continue;
                }

                // detach node
                node.parentNode && !node.hasAttribute("slot") && 
                    node.parentNode.removeChild(node);

                foundCmp = null;
                foundPromise = null;
                renderRef = null;
                renderer = new MetaphorJs.app.Renderer;
                state.$on("destroy", renderer.$destroy, renderer);
                renderer.on("reference", refCallback);
                renderer.on("reference-promise", promiseCallback);
                renderer.process(node, state);

                if (foundCmp || foundPromise) {
                    if (!renderRef) {
                        renderRef = self.defaultAddTo;
                    }
                    def = extend({
                        type: "component",
                        renderRef: renderRef,
                        renderer: renderer,
                        component: foundCmp || foundPromise,
                        resolved: !!foundCmp
                    }, self._createDefaultItemDef());
                    node[idkey] = def.id;
                }
                else {
                    attrSet = MetaphorJs.dom.getAttrSet(node);
                    renderRef = attrSet.at || attrSet.rest.slot || self.defaultAddTo;
                    def = extend({
                        type: "node",
                        renderRef: renderRef,
                        node: node
                    }, self._createDefaultItemDef());
                }

                found = true;
                renderer.un("reference", refCallback);
                renderer.un("reference-promise", promiseCallback);

                if (!self._itemsInitialized) {
                    if (!items[renderRef]) {
                        items[renderRef] = [];
                    }
                    items[renderRef].push(def);
                }
                else {
                    self.addItem(def);
                }
            }
        }

        if (found && !self._itemsInitialized) {
            self.items = items;
        }

    },

    _initItems: function() {

        var self = this,
            items = self.items || [],
            p2i = self.$self.propsToItems,
            defs,
            list = [],
            item, name,
            i, l, ref;

        self._itemsInitialized = true;
        self.itemsMap = {};

        if (isArray(items)) {
            var tmp = {};
            tmp[self.defaultAddTo] = items;
            items = tmp;
        }

        if (p2i) {
            for (name in p2i) {
                if (self[name]) {
                    self._initIntoItems(self[name], p2i[name]);
                }
            }
        }

        for (ref in items) {
            defs = items[ref];
            if (!isArray(defs)) {
                defs = [defs];
            }
            for (i = -1, l = defs.length; ++i < l;) {
                item = self._processItemDef(defs[i]);

                if (item) {
                    item.renderRef = ref;
                    list.push(item);
                }
            }
        }

        self.items = list;
    },

    _getIdKey: function() {
        return "$$container_" + this.id;
    },

    _createDefaultItemDef: function() {
        var id = nextUid();
        return {
            __containerItemDef: true,
            type: "component",
            placeholder: window.document.createComment("*" + this.id + "*" + id + "*"),
            id: id,
            resolved: true,
            processed: false,
            attached: false
        };
    },

    _processItemDef: function(def, ext) {

        var self = this,
            idkey = self._getIdKey(),
            item;

        if (def.__containerItemDef) {
            item = def;
            self.itemsMap[item.id] = item;
        }
        else {
            item = self._createDefaultItemDef();

            if (ext) {
                extend(item, ext, false, false);
            }

            self.itemsMap[item.id] = item;

            // component[idkey] = item.id
            // every child component contains `idkey` field
            // holding its id in parent container;
            // and by idkey itself we can identify container

            if (typeof def === "string") {
                def = self._initStringItem(def);
            }
            if (isPlainObject(def)) {
                def = self._initObjectItem(def);
            }

            if (isPlainObject(def)) {
                item = extend({}, def, item, false, false);
                self.itemsMap[item.id] = item; // rewrite item map
            }
            else if (typeof def === "function") {
                item.component = new def({
                    state: self.state.$new()
                });
            }
            else if (def instanceof MetaphorJs.app.Component) {
                item.component = def;
            }
            else if (def instanceof window.Node) {
                item.type = "node";
                item.node = def;
            }
            else if (def instanceof MetaphorJs.app.Template) {
                item.component = new MetaphorJs.app.Component({
                    state: self.state,
                    template: def
                });
            }
            else if (typeof def === "string") {
                var cfg = { state: self.state };
                item.component = MetaphorJs.app.resolve(def, cfg);
            }
            else if (isThenable(def)) {
                item.component = def;
            }
            else {
                throw new Error("Failed to initialize item");
            }
        }

        if (!item.processed) {

            var prevItem = item;

            if (!self._allowChildItem(item)) {
                return null;
            }

            if (item.type === "node") {
                item = self._wrapChildItem(item);
                item.node[idkey] = item.id;
            }
            else if (item.type === "component") {
                if (isThenable(item.component)) {
                    item.resolved = false;
                    item.component.done(function(cmp){
                        item.component = cmp;
                        if (!self._allowChildItem(item)) {
                            return null;
                        }
                        item = self._wrapChildItem(item);
                        item.component[idkey] = item.id;
                        self._onChildResolved(item.component);
                    });
                }
                else {
                    item = self._wrapChildItem(item);
                    item.component[idkey] = item.id;
                    self._onChildResolved(item.component);
                }
            }

            // item got wrapped
            if (prevItem !== item) {
                delete self.itemsMap[prevItem.id];
                self.itemsMap[item.id] = item;
            }

            self._initChildItem(item);
            self.$callMixins("$initChildItem", item);

            item.processed = true;
        }

        return item;
    },

    _initChildItem: function(item) {},

    _allowChildItem: function(item) {
        var allow = this.$self.allowItems || ["*"];
        typeof allow === "string" && (allow = [allow]);
        if (allow.indexOf("*") !== -1)  {
            return true;
        }
        if (item.type === "component") {
            return allow.indexOf(item.component.$class) !== -1;
        }
        return true;
    },

    _wrapChildItem: function(item) {

        var self = this,
            cls = self.$self,
            allow = cls.allowUnwrapped || [],
            wrapper = cls.wrapper,
            wrapCls;

        typeof allow === "string" && (allow = [allow]);

        if (!wrapper || allow.indexOf("*") !== -1) {
            return item;
        }

        if (item.type === "component") {

            if (allow.indexOf(item.component.$class) !== -1) {
                return item;
            }

            wrapCls = typeof wrapper === "string" || typeof wrapper === "function" ? 
                        wrapper :
                        (wrapper[item.component.$class] || wrapper["*"]);
            wrapCls = typeof wrapper === "string" ? ns.get(wrapper) : wrapper;

            var newItem = self._createDefaultItemDef();
            newItem.component = new wrapCls({
                state: self.state,
                items: [
                    item.component
                ]
            });

            return newItem;
        }

        return item;
    },

    _initObjectItem: function(def) {
        return def;
    },

    _initStringItem: function(def) {
        if (def.substring(0,1) === '<') {
            var div = document.createElement("div");
            div.innerHTML = def;
            return div.firstChild;
        }
        return def;
    },

    _initChildEvents: function(mode, cmp) {
        var self = this;
        cmp[mode]("remove-from-container", self._onChildRemove, self);
    },

    _onChildRemove: function(cmp) {
        var self = this,
            idkey = self._getIdKey(),
            itemid = cmp[idkey],
            item, inx;

        if (itemid && (item = self.itemsMap[itemid])) {
            delete cmp[idkey];
            delete self.itemsMap[itemid];
            inx = self.items.indexOf(item);
            if (cmp instanceof MetaphorJs.app.Component) {
                self._initChildEvents("un", cmp);
            }
            if (inx !== -1) {
                self.items.splice(inx, 1);
            }
            self._detachChildItem(item);
        }
    },

    _onChildResolved: function(cmp) {
        
        var self = this,
            idkey = self._getIdKey(),
            itemid = cmp[idkey],
            item, ref;

        if (itemid && (item = self.itemsMap[itemid])) {
            item.resolved = true;
            item.component = cmp;

            if (ref = cmp.config.get("ref")) {
                self._onChildReference("cmp", ref, cmp);
            }

            self._initChildEvents("on", cmp);

            if (self._rendered) {
                item.component.render();
                self._putItemInPlace(item);
            }
        }
    },

    _initIntoItems: function(smth, cls) {
        var self = this,
            item = self._createDefaultItemDef();

        typeof cls === "string" && (cls = ns.get(cls));

        if (!(smth instanceof cls)) {
            smth = cls.createFromPlainObject(smth);
        }

        item.component = smth;
        item.resolved = !isThenable(smth);
        !self.items && (self.items = []);
        if (isArray(self.items)) {
            self.items.push(item);
        }
        else {
            self.items.body.push(item);
        }
    },

    render: function() {

        var self = this,
            items = self.items || [],
            i, l;

        for (i = -1, l = items.length; ++i < l;){
            if (items[i].type === "component" && items[i].resolved) {
                items[i].component.render();
            }
        }

        self.$super.apply(self, arguments);
    },


    _onTemplateAttached: function() {
        var self = this, i, l, items = self.items;

        // insert all placeholders, but
        // attach only resolved items
        for (i = -1, l = items.length; ++i < l;){
            self._putItemInPlace(items[i]);
        }

        self.$super();
    },

    _putItemInPlace: function(item) {
        var self = this;
        if (item.placeholder && !item.placeholder.parentNode) {
            self._preparePlaceholder(item);
        }
        if (item.resolved && !item.attached) {
            if (item.renderRef) {
                self.template.setNamedNode(item.renderRef, item.node || item.component);
            }
            self._attachChildItem(item);
        }
    },

    _preparePlaceholder: function(item) {
        var self = this,
            refnode = self.getRefEl(item.renderRef);

        if (item.type === "node" && item.node.hasAttribute("slot")) {
            return;
        }

        if (!refnode) {
            throw new Error("Can't find referenced node: " + item.renderRef);
        }

        // if refnode is <slot> we do nothing;
        // when attaching, we just set "slot" attribute on item
        if (refnode instanceof window.HTMLSlotElement) {
            return;
        }

        // comment
        if (refnode.nodeType === window.document.COMMENT_NODE) {
            refnode.parentNode.insertBefore(item.placeholder, refnode);
        }
        else refnode.appendChild(item.placeholder);
    },

    // only resolved components get here; so do attach
    _attachChildItem: function(item) {
        var self = this,
            refnode = self.getRefEl(item.renderRef);

        if (item.attached) {
            return;
        }

        if (item.type === "node") {
            if (item.node.hasAttribute("slot")) {
                item.attached = true;
                return;
            }
            if (refnode instanceof window.HTMLSlotElement) {
                item.node.setAttribute("slot", refnode.getAttribute("name"));
            }
            else if (refnode.nodeType === window.document.COMMENT_NODE) {
                refnode.parentNode.insertBefore(item.node, item.placeholder);
            }
            else {
                refnode.insertBefore(item.node, item.placeholder);
            }
        }
        else if (item.type === "component") {
            if (refnode.nodeType === window.document.COMMENT_NODE)
                item.component.render(refnode.parentNode, item.placeholder);    
            else item.component.render(refnode, item.placeholder);
        }

        item.attached = true;
    },

    _detachChildItem: function(item) {
        if (!item.attached) {
            return;
        }
        if (item.type === "node") {
            item.node.parentNode && item.node.parentNode.removeChild(item.node);
        }
        else if (item.type === "component") {
            item.component.detach();
            item.placeholder.parentNode && 
                item.placeholder.parentNode.removeChild(item.placeholder);
        }
        item.attached = false;
    },

    hasItem: function(cmp) {
        var self = this,
            idkey = self._getIdKey(),
            id,
            item;

        if (typeof cmp === "string" || typeof cmp === "function") {
            for (id in self.itemMap) {
                item = self.itemMap[id];
                if (item.type === "component" && 
                    (item.componet.id === cmp || item.component.$is(cmp))) {
                    return true;
                }
            }
            return false;
        }
        else return !!cmp[idkey];
    },

    hasItemIn: function(ref, smth) {
        if (!this.items[ref] || this.items[ref].length === 0) {
            return false;
        }
        var i, l, item;
        for (i = 0, l = this.items[ref].length; i < l; i++) {
            item = this.items[ref][i];
            if (item.type === "component") {
                if (item.component.$is(smth)) {
                    return true;
                }
            }
        }
        return false;
    },

    addItem: function(cmp, to) {
        var self = this,
            item;

        if (self.hasItem(cmp)) {
            return;
        }

        if (cmp instanceof MetaphorJs.app.Component) {
            cmp.trigger("remove-from-container", cmp);
        }

        item = self._processItemDef(cmp, {
            renderRef: to || self.defaultAddTo
        });
        self.items.push(item);

        // component item got attached via onChildResolved
        if (item.type === "node" && self._attached) {
            self._putItemInPlace(item);
        }
    },

    removeItem: function(cmp) {
        var self = this;

        if (!self.hasItem(cmp)) {
            return;
        }

        if (cmp instanceof MetaphorJs.app.Component) {
            cmp.trigger("remove-from-container", cmp);
        }
        else {
            self._onChildRemove(cmp);
        }
    },

    onDestroy: function() {

        var self = this,
            i, l, item;

        for (i = 0, l = self.items.length; i < l; i++) {
            item = self.items[i];
            if (item.renderer) {
                item.renderer.$destroy();
            }
            if (item.type === "component") {
                item.component.$destroy && item.component.$destroy();
            }
        }
        self.items = null;

        self.$super();
    }
}, {

    allowItems: ["*"],
    allowUnwrapped: ["*"],
    wrapper: null

});