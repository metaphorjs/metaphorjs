
require("./__init.js");
require("./Component.js");
require("./Template.js");
require("./Renderer.js");
require("../func/app/resolve.js");
require("../func/dom/getAttrSet.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js");

module.exports = MetaphorJs.app.Container = MetaphorJs.app.Component.$extend({

    initComponent: function() {
        var self = this;

        self.$super.apply(self, arguments);

        if (self.node && self.template && self.node.firstChild) {
            self._prepareDeclaredItems(toArray(self.node.childNodes));
        }

        self._initItems();
    },

    _prepareDeclaredItems: function(nodes) {

        var self = this,
            i, l, node, renderer,
            found = false,
            renderRef, attrSet,
            foundCmp, foundPromise,
            scope = self.config.getOption("scope"),
            items = self.items || [],

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

        if (isArray(items)) {
            items = {
                body: items
            }
        }

        for (i = 0, l = nodes.length; i < l; i++) {
            node = nodes[i];
            if (node.nodeType === 1) {

                foundCmp = null;
                foundPromise = null;
                renderRef = null;
                renderer = new MetaphorJs.app.Renderer(node, scope);
                renderer.on("reference", refCallback);
                renderer.on("reference-promise", promiseCallback);
                renderer.process();

                if (foundCmp || foundPromise) {
                    if (!renderRef) {
                        renderRef = "body";
                    }
                    if (!items[renderRef]) {
                        items[renderRef] = [];
                    }
                    items[renderRef].push({
                        __containerItemDef: true,
                        type: "component",
                        renderRef: renderRef,
                        renderer: renderer,
                        component: foundCmp || foundPromise,
                        resolved: !!foundCmp
                    });
                }
                else {
                    attrSet = MetaphorJs.dom.getAttrSet(node);
                    renderRef = attrSet.at || "body";
                    if (!items[renderRef]) {
                        items[renderRef] = [];
                    }
                    items[renderRef].push({
                        __containerItemDef: true,
                        type: "node",
                        renderRef: renderRef,
                        node: node
                    });
                }

                found = true;

                renderer.un("reference", refCallback);
                renderer.un("reference-promise", promiseCallback);
            }
        }

        if (found) {
            self.items = items;
        }

    },

    _initItems: function() {

        var self = this,
            items = self.items || [],
            defs,
            list = [],
            item,
            i, l, ref;

        self.itemsMap = {};

        if (isArray(items)) {
            items = {
                body: items
            }
        }

        for (ref in items) {
            defs = items[ref];
            if (!isArray(defs)) {
                defs = [defs];
            }
            for (i = -1, l = defs.length; ++i < l;) {
                item = self._processItemDef(defs[i]);
                item.renderRef = ref;
                list.push(item);

                // moved to _processItemDef
                //self.itemsMap[item.id] = item;
            }
        }

        self.items = list;
    },

    _getIdKey: function() {
        return "$$container_" + this.id;
    },

    _createDefaultItemDef: function() {
        return {
            __containerItemDef: true,
            type: "component",
            placeholder: window.document.createComment("***"),
            id: nextUid(),
            resolved: true
        };
    },

    _processItemDef: function(def) {

        var self = this,
            idkey = self._getIdKey(),
            item = self._createDefaultItemDef();

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
                scope: self.scope.$new()
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
                scope: self.scope,
                template: def
            });
        }
        else if (typeof def === "string") {
            var cfg = {scope: self.scope};
            item.component = MetaphorJs.app.resolve(def, cfg);
        }
        else if (isThenable(def)) {
            item.component = def;
        }
        else {
            throw new Error("Failed to initialize item");
        }

        var prevItem = item;

        if (item.type === "node") {
            item = self._wrapChildItem(item);
            item.node[idkey] = item.id;
        }
        else if (item.type === "component") {
            if (isThenable(item.component)) {
                item.resolved = false;
                item.component.done(function(cmp){
                    item.component = cmp;
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

        this._initChildItem(item);

        return item;
    },

    _initChildItem: function(item) {

    },

    _wrapChildItem: function(item) {
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
                self._attachChildItem(item);
            }
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

    _onRenderingFinished: function() {
        var self = this, i, l, items = self.items;
        self.$super();

        // empty container without template or content
        if (!self.node.firstChild) {
            self.$refs.node.body = self.node;
        }

        // insert all placeholders, but
        // attach only resolved items
        for (i = -1, l = items.length; ++i < l;){
            self._preparePlaceholder(items[i]);
            if (items[i].resolved) {
                self._attachChildItem(items[i]);
            }
        }
    },

    _preparePlaceholder: function(item) {
        var self = this,
            refnode = self.getRefEl(item.renderRef);
        if (!refnode) {
            throw new Error("Can't find referenced node: " + item.renderRef);
        }
        // comment
        if (refnode.nodeType === 8) {
            refnode.parentNode.insertBefore(item.placeholder, refnode);
        }
        else refnode.appendChild(item.placeholder);
    },

    // only resolved components get here; so do attach
    _attachChildItem: function(item) {
        var self = this,
            refnode = self.getRefEl(item.renderRef);

        if (item.type === "node") {
            if (refnode.nodeType === 8)
                refnode.parentNode.insertBefore(item.node, item.placeholder);
            else refnode.insertBefore(item.node, item.placeholder);
        }
        else if (item.type === "component") {
            if (refnode.nodeType === 8)
                item.component.render(refnode.parentNode, item.placeholder);    
            else item.component.render(refnode, item.placeholder);
        }
    },

    _detachChildItem: function(item) {
        if (item.type === "node") {
            item.node.parentNode && item.node.parentNode.removeChild(item.node);
        }
        else if (item.type === "component") {
            item.component.detach();
            item.placeholder.parentNode && 
                item.placeholder.parentNode.removeChild(item.placeholder);
        }
    },

    hasItem: function(cmp) {
        var self = this,
        idkey = self._getIdKey();
        return !!cmp[idkey];
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

        item = self._processItemDef(cmp);
        item.renderRef = to || "body";
        self.items.push(item);
        self.itemsMap[item.id] = item;

        if (self._rendered) {
            self._preparePlaceholder(item);
            if (item.resolved) {
                self._attachChildItem(item);
            }
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
});