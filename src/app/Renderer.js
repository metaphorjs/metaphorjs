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

        nodeChildren = function(res, el, fn, context, finish, opt) {

            var children = [],
                i, len;

            if (res && res !== true) {
                if (res.nodeType) {
                    opt.countdown += 1;
                    eachNode(res, fn, context, finish, opt);
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

            opt.countdown += len;

            for(i = -1;
                ++i < len;
                eachNode(children[i], fn, context, finish, opt)){}
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

        eachNode = function(el, fn, context, finish, opt) {

            if (!el) {
                return;
            }

            var res,
                tag = el.nodeName,
                prevScope;

            !opt && (opt = {});
            opt.countdown === undf && (opt.countdown = 1);

            prevScope = opt.scope;

            if (tag && skipMap[tag.toLowerCase()]) { //tag.match(rSkipTag)) {
                --opt.countdown === 0 && finish && finish.call(context);
                return;
            }

            res = fn.call(context, el, opt);

            if (res !== false) {

                if (opt.newScope) {
                    opt.scope = opt.newScope;
                    delete opt.newScope;
                }

                if (isThenable(res)) {

                    res.done(function(response) {

                        if (response !== false) {
                            nodeChildren(response, el, fn, context, finish, opt);
                        }

                        --opt.countdown === 0 && finish && finish.call(context);
                    });
                    return; // prevent countdown
                }
                else {
                    nodeChildren(res, el, fn, context, finish, opt);
                }

                if (prevScope) {
                    opt.scope = prevScope;
                }
            }

            delete opt.newScope;
            --opt.countdown === 0 && finish && finish.call(context);
        },

        applyDirective = function(dir, parentScope, node, config, attrs, renderer) {

            config.setDefaultMode("scope", MetaphorJs.lib.Config.MODE_STATIC);
            //config.setDefaultValue("scope", ":new", /*override: */false);

            var scope   = config.has("scope") ? 
                            MetaphorJs.lib.Scope.$produce(config.get("scope"), parentScope) :
                            parentScope,
                app     = parentScope.$app || scope.$app,
                inject  = {
                    $scope: scope,
                    $node: node,
                    $config: config,
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

            if (inst && inst.$destroy) {
                renderer && renderer.on("destroy", inst.$destroy, inst);
                !renderer && parentScope.$on("destroy", inst.$destroy, inst);
            }
            else if (typeof inst === "function") {
                renderer && renderer.on("destroy", inst);
                !renderer && parentScope.$on("destroy", inst);
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
        self._flowControlState = {};

        observer.createEvent("transclude-sources-"+self.id, "all");

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

        flowControl: function(key, value) {
            this._flowControlState[key] = value;
        },

        _resetFlowControl: function() {
            var fc = this._flowControlState;
            fc.waitFor = null;
            fc.nodes = null;
            fc.stop = false;
            fc.ignoreInside = false;
            fc.newScope = null;
        },

        _processCommentNode: function(node, treeOpt) {
            var cmtData = node.textContent || node.data;
            if (cmtData.substring(0,2) === '##') {
                this.trigger(
                    "reference", "node",
                    cmtData.substring(2), node
                );
            }
        },

        _processTextNode: function(node, treeOpt) {
            var self    = this,
                texts   = self.texts,
                textStr = node.textContent || node.nodeValue,
                textRenderer;

            if (MetaphorJs.lib.Text.applicable(textStr)) {
                textRenderer = new MetaphorJs.lib.Text(
                    treeOpt.scope || self.scope,
                    textStr
                );
                textRenderer.subscribe(self.onTextChange, self, {
                    append: [texts.length]
                });
                texts.push({node: node, tr: textRenderer});
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

        _processComponent: function(component, node, attrs, treeOpt) {
            var self = this,
                config = new MetaphorJs.lib.Config(
                    attrs.config, 
                    {scope: treeOpt.scope || self.scope}
                );
    
            var directive = MetaphorJs.app.Directive.getDirective("attr", "cmp");
            config.setProperty("value", {
                mode: MetaphorJs.lib.Config.MODE_STATIC,
                expression: component
            });

            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, treeOpt.scope || self.scope, 
                                    node, config, attrs, self);
        },

        _processTag: function(directive, node, attrs, treeOpt) {

            var self = this,
                config = new MetaphorJs.lib.Config(
                    attrs.config, 
                    {scope: treeOpt.scope || self.scope}
                );
            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, treeOpt.scope || self.scope, 
                                    node, config, attrs, self);
        },

        _processDirAttribute: function(node, directive, name, dcfg, attrs, treeOpt) {

            var self = this,
                config = new MetaphorJs.lib.Config(
                    dcfg,
                    {scope: treeOpt.scope || self.scope}
                );
            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, treeOpt.scope || self.scope, 
                                    node, config, attrs, self);
        },

        _processReferences: function(node, attrs, treeOpt) {
            var self = this, i, len, ref,
                scope = treeOpt.scope || self.scope;
            for (i = 0, len = attrs.references.length; i < len; i++) {
                ref = attrs.references[i];
                if (ref[0] === '#') {
                    self.trigger("reference", "node", ref.substring(1), node);
                }
                else {
                    scope[ref] = node;
                }
                MetaphorJs.dom.removeAttr(node, '#' + ref);
            }
        },

        _processAttribute: function(node, name, attrs, treeOpt) {
            var self = this,
                texts = self.texts,
                textStr = attrs['attributes'][name],
                textRenderer = new MetaphorJs.lib.Text(
                    treeOpt.scope || self.scope, 
                    textStr, 
                    {
                        //recursive: !!attrs.config.recursive,
                        fullExpr: !MetaphorJs.lib.Text.applicable(textStr)
                    }
                );

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


        _onFlowControl: function(defers, nodes, treeOpt, attrs) {
            var fc = this._flowControlState;
            fc.waitFor && defers.push(fc.waitFor);
            fc.nodes && collectNodes(nodes, fc.nodes);
            fc.ignoreInside && (attrs.renderer.ignoreInside = true);
            fc.newScope && (treeOpt.newScope = fc.newScope);
            this._resetFlowControl();
        },

        /**
         * Processes one signle node and gives glues on there to go next.<br>
         * Return false to skip this branch. Do not go inside this node.<br>
         * Return a Node or array of Nodes to add to processing list
         * along with this node's children<br>
         * Return a Promise resolving in any of the above
         * @param {Node} node 
         * @returns {boolean|array|Promise|Node}
         */
        processNode: function(node, treeOpt) {

            var self        = this,
                nodeType    = node.nodeType;

            if (nodeType === nodeCmt) {
                self._processCommentNode(node, treeOpt);
            }
            else if (nodeType === nodeText) {
                self._processTextNode(node, treeOpt);
            }
            else if (nodeType === nodeElem) {

                self._resetFlowControl();

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    fc = self._flowControlState,
                    component, directive,
                    name, ds,
                    i, len,
                    j, jlen,
                    attrs = MetaphorJs.dom.getAttrSet(node);

                if (tag.substr(0, 4) === "mjs-") {
                    tag = tag.substr(4);
                }
                if (tag === "slot") {
                    return this._processSlotNode(node);
                }
                if (attrs.renderer.ignore) {
                    return false;
                }
                if (attrs.__plain && !dirs.component[tag] && !dirs.tag[tag]) {
                    return;
                }

                // this tag represents component
                // we just pass it to attr.cmp directive
                // by adding it to the attr map
                if (component = dirs.component[tag]) {
                    attrs.__remove(node, "config");
                    self._processComponent(component, node, attrs, treeOpt);
                }
                else if (directive = dirs.tag[tag]) {
                    self._processTag(directive, node, attrs, treeOpt);
                }

                if (fc.stop) return false;
                self._onFlowControl(defers, nodes, treeOpt, attrs);

                if (attrs.references && attrs.references.length) {
                    self._processReferences(node, attrs, treeOpt);
                }

                // this is an attribute directive
                for (i = 0, len = handlers.length; i < len; i++) {
                    
                    name = handlers[i].name;

                    if ((ds = attrs['directives'][name]) !== undf &&
                        !attrs['__directives'][name].handled) {

                        attrs.__remove(node, "directive", name);
                        attrs.__directives[name].handled = true;

                        for (j = 0, jlen = ds.length; j < jlen; j++) {
                            self._processDirAttribute(
                                node, handlers[i].handler, name, 
                                ds[j], attrs, treeOpt
                            );
                            
                            if (fc.stop) return false;
                            self._onFlowControl(defers, nodes, treeOpt, attrs);
                        }
                    }
                }

                for (i in attrs['attributes']) {
                    self._processAttribute(node, i, attrs, treeOpt);
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
                    self.onProcessingFinished, 
                    {countdown: 1, scope: self.scope});
            }
            else {
                nodeChildren(
                    null, node, self.processNode,
                    self, self.onProcessingFinished, 
                    {countdown: 0, scope: self.scope});
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

            observer.destroyEvent("transclude-sources-"+self.id);
            observer.destroyEvent("destroy-" + self.id);
            observer.destroyEvent("rendered-" + self.id);
            observer.destroyEvent("reference-" + self.id);
            observer.destroyEvent("reference-promise-" + self.id);
            observer.destroyEvent("attached-" + self.id);

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

