require("../lib/Scope.js");
require("metaphorjs-observable/src/lib/Observable.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("../lib/Text.js");
require("../func/dom/setAttr.js");
require("./Directive.js");
require("../lib/Config.js");
require("../func/dom/removeAttr.js");
require("../func/dom/getAttrSet.js");

var nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    undf = require("metaphorjs-shared/src/var/undf.js");


module.exports = MetaphorJs.app.Renderer = function() {

    var handlers                = null,
        dirs                    = MetaphorJs.directive,

        nodeCmt                 = window.document.COMMENT_NODE,
        nodeText                = window.document.TEXT_NODE,
        nodeElem                = window.document.ELEMENT_NODE,

        nodeChildren = function(res, el, fn, fnScope, finish, cnt) {

            var children = [],
                i, len;

            if (res && res !== true) {
                if (res.nodeType) {
                    cnt.countdown += 1;
                    eachNode(res, fn, fnScope, finish, cnt);
                    return;
                }
                else {
                    children = res.slice();
                }
            }

            if (!children.length) {
                children = toArray(el.childNodes || el);
            }

            len = children.length;

            cnt.countdown += len;

            for(i = -1;
                ++i < len;
                eachNode(children[i], fn, fnScope, finish, cnt)){}
        },


        collectNodes    = function(coll, add) {

            if (add) {
                if (add.nodeType) {
                    coll.push(add);
                }
                else if (isArray(add)) {
                    for (var i = -1, l = add.length; ++i < l; collectNodes(coll, add[i])){}
                }
            }
        },

        skipMap = {
            "script": true,
            "template": true,
            "mjs-template": true,
            "style": true,
            "link": true
        },

        eachNode = function(el, fn, fnScope, finish, cnt) {

            if (!el) {
                return;
            }

            var res,
                tag = el.nodeName;

            if (!cnt) {
                cnt = {countdown: 1};
            }

            if (tag && skipMap[tag.toLowerCase()]) { //tag.match(rSkipTag)) {
                --cnt.countdown === 0 && finish && finish.call(fnScope);
                return;
            }

            res = fn.call(fnScope, el);

            if (res !== false) {

                if (isThenable(res)) {

                    res.done(function(response){

                        if (response !== false) {
                            nodeChildren(response, el, fn, fnScope, finish, cnt);
                        }

                        --cnt.countdown === 0 && finish && finish.call(fnScope);
                    });
                    return; // prevent countdown
                }
                else {
                    nodeChildren(res, el, fn, fnScope, finish, cnt);
                }
            }

            --cnt.countdown === 0 && finish && finish.call(fnScope);
        },

        applyDirective = function(dir, parentScope, node, config, attrs, renderer) {

            config.setDefaultMode("scope", MetaphorJs.lib.Config.MODE_STATIC);

            var scope   = config.has("scope") ? 
                            MetaphorJs.lib.Scope.$produce(config.get("scope")) :
                            dir.$breakScope  ?
                                parentScope.$new() :
                                parentScope,
                app     = parentScope.$app,
                inject  = {
                    $scope: scope,
                    $node: node,
                    $nodeConfig: config,
                    $attrSet: attrs,
                    $renderer: renderer
                },
                args    = [scope, node, config, renderer, attrs],
                inst;
            
            if (config.has("scope")) {
                config.setOption("scope", scope);
            }

            if (app) {
                inst = app.inject(dir, null, inject, args);
            }
            else if (dir.$instantiate) {
                inst = dir.$instantiate.apply(dir, args);
            }
            else {
                inst = dir.apply(null, args);
            }

            if (app && dir.$registerBy && inst) {
                if (isThenable(inst)) {
                    inst.done(function(cmp){
                        app.registerCmp(cmp, parentScope, dir.$registerBy);
                    });
                }
                else {
                    app.registerCmp(inst, parentScope, dir.$registerBy);
                }
            }

            if (inst && inst.$destroy) {
                renderer && renderer.on("destroy", inst.$destroy, inst);
                !renderer && parentScope.$on("destroy", inst.$destroy, inst);
            }
            else if (typeof inst === "function") {
                renderer && renderer.on("destroy", inst);
                !renderer && parentScope.$on("destroy", inst);
            }

            if (dir.$stopRenderer) {
                return false;
            }

            return inst;
        },

        observer = new MetaphorJs.lib.Observable;

    var Renderer = function(scope, parent) {

        var self            = this;

        self.id             = nextUid();
        self.scope          = scope;
        self.texts          = [];
        self.parent         = parent;

        if (scope instanceof MetaphorJs.lib.Scope) {
            scope.$on("destroy", self.$destroy, self);
        }

        if (parent) {
            parent.on("destroy", self.$destroy, self);
        }
    };
    
    
    extend(Renderer.prototype, {

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,
        destroyed: false,

        on: function(event, fn, context, opt) {
            return observer.on(event + '-' + this.id, fn, context, opt);
        },

        un: function(event, fn, context) {
            return observer.un(event + '-' + this.id, fn, context);
        },

        trigger: function(event) {
            arguments[0] = event + "-" + this.id;
            return observer.trigger.apply(observer, arguments);
        },

        attached: function(to) {
            this.trigger("attached", this, to);
        },

        detached: function() {
            this.trigger("detached", this);
        },

        _processCommentNode: function(node) {
            var cmtData = node.textContent || node.data;
            if (cmtData.substring(0,2) === '##') {
                this.trigger(
                    "reference", "node",
                    cmtData.substring(2), node
                );
            }
        },

        _processTextNode: function(node) {
            var self    = this,
                texts   = self.texts,
                textStr = node.textContent || node.nodeValue,
                textRenderer;

            if (MetaphorJs.lib.Text.applicable(textStr)) {
                textRenderer = new MetaphorJs.lib.Text(
                    self.scope,
                    textStr
                );
                textRenderer.subscribe(self.onTextChange, self, {
                    append: [texts.length]
                });
                texts.push({
                    node: node,
                    tr: textRenderer
                });
                self.renderText(texts.length - 1);
            }
        },

        // skip <slot> but reference it same way as ##ref
        _processSlotNode: function(node) {
            this.trigger(
                "reference", "node",
                node.getAttribute("name"), node
            );
            return false;
        },

        _processComponent: function(component, node, attrs) {
            var self = this,
                config = new MetaphorJs.lib.Config(
                    attrs.config, 
                    {scope: self.scope}
                );
    
            var directive = MetaphorJs.app.Directive.getDirective("attr", "cmp");
            config.setProperty("value", {
                mode: MetaphorJs.lib.Config.MODE_STATIC,
                expression: component
            });

            self.on("destroy", config.$destroy, config);

            return applyDirective(
                directive, self.scope, node, 
                config, attrs, self) || false;
        },

        _processTag: function(directive, node, attrs) {

            var self = this,
                config = new MetaphorJs.lib.Config(
                    attrs.config, 
                    {scope: self.scope}
                );
            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, self.scope, node, config, attrs, self);
        },

        _processDirAttribute: function(node, directive, name, attrs) {
            var self = this,
                config = new MetaphorJs.lib.Config(
                    attrs.directives[name], 
                    {scope: self.scope}
                );
            self.on("destroy", config.$destroy, config);
            attrs.__remove(node, "directive", name);
            attrs.__directives[name].handled = true;

            return applyDirective(directive, self.scope, node, config, attrs, self);
        },

        _processReferences: function(node, attrs) {
            var self = this, i, len, ref;
            for (i = 0, len = attrs.references.length; i < len; i++) {
                ref = attrs.references[i];
                if (ref[0] === '#') {
                    self.trigger("reference", "node", ref.substring(1), node);
                }
                else {
                    self.scope[ref] = node;
                }
                MetaphorJs.dom.removeAttr(node, '#' + ref);
            }
        },

        _processAttribute: function(node, name, attrs) {
            var self = this,
                texts = self.texts,
                textStr = attrs['attributes'][name],
                textRenderer = new MetaphorJs.lib.Text(self.scope, textStr, {
                    //recursive: !!attrs.config.recursive,
                    fullExpr: !MetaphorJs.lib.Text.applicable(textStr)
                });

            MetaphorJs.dom.removeAttr(node, attrs['__attributes'][name]);
            textRenderer.subscribe(self.onTextChange, self, {
                append: [texts.length]
            });
            texts.push({
                node: node,
                attr: name,
                tr: textRenderer
            });
            self.renderText(texts.length - 1);
        },

        /**
         * Processes one signle node and gives glues on there to go next.<br>
         * Return false to skip this branch. Do not go inside this node.<br>
         * Return a Node or array of Nodes to add to processing list
         * along with this node's children<br>
         * Return a Promise resolving in any of the above
         * @param {Node} node 
         * @param {object} attrSet {
         *  Usually you don't pass this one. If skipped, attrSet will be taken directly 
         *  from the node which is the default behavior. This param is used
         *  for virtual nodes.
         * }
         * @returns {boolean|array|Promise|Node}
         */
        processNode: function(node, attrs) {

            var self        = this,
                nodeType    = node.nodeType;

            if (nodeType === nodeCmt) {
                self._processCommentNode(node);
            }
            else if (nodeType === nodeText) {
                self._processTextNode(node);
            }
            else if (nodeType === nodeElem) {

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    component,
                    directive,
                    i, len,
                    name,
                    res;

                attrs = attrs || MetaphorJs.dom.getAttrSet(node);

                if (tag.substr(0, 4) === "mjs-") {
                    tag = tag.substr(4);
                }
                if (tag === "slot") {
                    return this._processSlotNode(node);
                }

                if (attrs.renderer.ignore) {
                    return false;
                }

                // this tag represents component
                // we just pass it to attr.cmp directive
                // by adding it to the attr map
                if (component = dirs.component[tag]) {
                    res = self._processComponent(component, node, attrs);
                    if (res === false) return false;
                    isThenable(res) ? defers.push(res) : collectNodes(nodes, res);
                }
                else if (directive = dirs.tag[tag]) {
                    res = self._processTag(directive, node, attrs);
                    if (res === false) return false;
                    isThenable(res) ? defers.push(res) : collectNodes(nodes, res);
                }

                if (attrs.references && attrs.references.length) {
                    self._processReferences(node, attrs);
                }

                // this is an attribute directive
                for (i = 0, len = handlers.length; i < len; i++) {
                    name = handlers[i].name;
                    if (attrs['directives'][name] !== undf &&
                        !attrs['__directives'][name].handled) {
                        res = self._processDirAttribute(
                            node, handlers[i].handler, name, attrs
                        );
                        if (res === false) return false;
                        isThenable(res) ? defers.push(res) : collectNodes(nodes, res);
                    }
                }

                for (i in attrs['attributes']) {
                    self._processAttribute(node, i, attrs);
                }

                if (attrs.renderer.ignoreInside) {
                    return false;
                }

                if (defers.length) {
                    var deferred = new MetaphorJs.lib.Promise;
                    MetaphorJs.lib.Promise.all(defers).done(function(values){
                        collectNodes(nodes, values);
                        deferred.resolve(nodes);
                    });
                    return deferred;
                }

                return nodes.length ? nodes : true;
            }

            return true;
        },

        process: function(node) {
            var self    = this;

            if (!handlers) {
                handlers = MetaphorJs.app.Directive.getAttributes();
            }
            if (!node) {
                return;
            }

            if (node.nodeType) {
                eachNode(node, self.processNode, self,
                    self.onProcessingFinished, {countdown: 1});
            }
            else {
                nodeChildren(
                    null, node, self.processNode,
                    self, self.onProcessingFinished, {countdown: 0});
            }
        },

        onProcessingFinished: function() {
            observer.trigger("rendered-" + this.id, this);
        },


        onTextChange: function(textRenderer, inx) {
            this.renderText(inx);
        },

        renderText: function(inx) {

            var self        = this,
                text        = self.texts[inx],
                res         = text.tr.getString(),
                attrName    = text.attr;

            if (res === undf || res === null) {
                res = "";
            }

            if (attrName) {

                if (attrName === "value") {
                    text.node.value = res;
                }
                else if (attrName === "class") {
                    text.node.className = res;
                }
                else if (attrName === "src") {
                    text.node.src = res;
                }

                MetaphorJs.dom.setAttr(text.node, attrName, res);
            }
            else {
                //text.node.textContent = res;
                text.node.nodeValue = res;
            }
        },


        $destroy: function() {

            var self    = this,
                texts   = self.texts,
                i, len;

            if (self.destroyed) {
                return;
            }

            for (i = -1, len = texts.length; ++i < len; texts[i].tr.$destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.$destroy, self);
            }

            observer.trigger("destroy-" + self.id);

            observer.destroyEvent("destroy-" + self.id);
            observer.destroyEvent("rendered-" + self.id);
            observer.destroyEvent("reference-" + self.id);
            observer.destroyEvent("reference-promise-" + self.id);

            for (var k in self) {
                if (self.hasOwnProperty(k)) {
                    self[k] = null;
                }
            }

            self.destroyed = true;
        }

    });
    
    Renderer.skip = function(tag, value) {
        skipMap[tag] = value;
    };

    Renderer.applyDirective = applyDirective;

    return Renderer;

}();

