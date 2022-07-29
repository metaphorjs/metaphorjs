require("../lib/State.js");
require("metaphorjs-observable/src/lib/Observable.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("../lib/Text.js");
require("../func/dom/setAttr.js");
require("./Directive.js");
require("../lib/Config.js");
require("../func/dom/removeAttr.js");
require("../func/dom/getAttrSet.js");

const nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");


module.exports = MetaphorJs.app.Renderer = function() {

    let handlers                = null;
    const dirs                    = MetaphorJs.directive,
        nodeCmt                 = window.document.COMMENT_NODE,
        nodeText                = window.document.TEXT_NODE,
        nodeElem                = window.document.ELEMENT_NODE,

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

        applyDirective = function(dir, parentState, node, config, attrs, renderer) {

            config.setDefaultMode("state", MetaphorJs.lib.Config.MODE_STATIC);

            const state = config.has("state") ? 
                            MetaphorJs.lib.State.$produce(config.get("state"), parentState) :
                            parentState,
                app     = parentState.$app || state.$app,
                inject  = {
                    $state: state,
                    $node: node,
                    $config: config,
                    $attrSet: attrs,
                    $renderer: renderer
                },
                args    = [state, node, config, renderer, attrs],
                processRes = function(res) {
                
                    if (res && res.$destroy) {
                        if (renderer) {
                            if (renderer.$destroyed) res.$destroy();
                            else renderer.on("destroy", res.$destroy, res);
                        }
                        else parentState.$on("destroy", res.$destroy, res);
                    }
                    else if (typeof res === "function") {
                        if (renderer) {
                            if (renderer.$destroyed) res();
                            else renderer.on("destroy", res);
                        }
                        else parentState.$on("destroy", res);
                    }
                };

            let res;

            if (config.has("state")) {
                config.setOption("state", state);
            }

            if (app) {
                res = app.inject(dir, null, inject, args);
            }
            else if (dir.$instantiate) {
                res = dir.$instantiate.apply(dir, args);
            }
            else {
                res = dir.apply(null, args);
            }

            if (isThenable(res)) {
                res.done(processRes);
            }
            else processRes(res);

            return res;
        },

        observer = new MetaphorJs.lib.Observable;

    var Renderer = function(parent) {

        var self            = this;

        self.id             = nextUid();
        self.parent         = parent;

        self._texts             = [];
        self._flowControlState  = {};
        self._treeState = {
            countdown: 0
        };

        observer.createEvent("transclude-sources-" + self.id, "all");
        observer.createEvent("rendered-" + self.id, {
            limit: 1
        });

        if (parent) {
            parent.on("destroy", self.$destroy, self);
        }
    };
    
    
    extend(Renderer.prototype, {

        id: null,
        parent: null,

        _flowControlState: null,
        _treeState: null,
        _texts: null,
        $destroyed: false,

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

        _resetFC: function() {
            var fc = this._flowControlState;
            fc.waitFor = null;
            fc.nodes = null;
            fc.stop = false;
            fc.ignoreInside = false;
            fc.newState = null;
        },

        _checkFCState: function(defers, nodes, attrs) {
            var fc = this._flowControlState;
            fc.waitFor && defers && defers.push(fc.waitFor);
            fc.nodes && nodes && collectNodes(nodes, fc.nodes);
            fc.ignoreInside && attrs && (attrs.renderer.ignoreInside = true);
            fc.newState && (this._treeState.newState = fc.newState);
            this._resetFC();
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
                texts   = self._texts,
                textStr = node.textContent || node.nodeValue,
                textRenderer;

            if (MetaphorJs.lib.Text.applicable(textStr)) {
                textRenderer = new MetaphorJs.lib.Text(
                    self._treeState.state,
                    textStr
                );
                textRenderer.subscribe(self._onTextChange, self, {
                    append: [texts.length]
                });
                texts.push({node: node, tr: textRenderer});
                self._renderText(texts.length - 1);
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
                    {state: self._treeState.state}
                );
    
            var directive = MetaphorJs.app.Directive.getDirective("attr", "cmp");
            config.setProperty("value", {
                mode: MetaphorJs.lib.Config.MODE_STATIC,
                expression: component
            });

            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, self._treeState.state, 
                                    node, config, attrs, self);
        },

        _processTag: function(directive, node, attrs) {
            var self = this,
                config = new MetaphorJs.lib.Config(
                    attrs.config, 
                    {state: self._treeState.state}
                );
            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, self._treeState.state, 
                                    node, config, attrs, self);
        },

        _processDirAttribute: function(node, directive, name, dcfg, attrs) {

            var self = this,
                config = new MetaphorJs.lib.Config(
                    dcfg,
                    {state: self._treeState.state}
                );
            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, self._treeState.state, 
                                    node, config, attrs, self);
        },

        _processReferences: function(node, attrs) {
            var self = this, i, len, ref,
                state = self._treeState.state;
            for (i = 0, len = attrs.references.length; i < len; i++) {
                ref = attrs.references[i];
                if (ref[0] === '#') {
                    self.trigger("reference", "node", ref.substring(1), node);
                }
                else {
                    state[ref] = node;
                }
                MetaphorJs.dom.removeAttr(node, '#' + ref);
            }
        },

        _processAttribute: function(node, name, attrs) {
            var self = this,
                texts = self._texts,
                textStr = attrs['attributes'][name],
                textRenderer = new MetaphorJs.lib.Text(
                    self._treeState.state, 
                    textStr, 
                    {
                        recursive: !!attrs.renderer.recursive,
                        fullExpr: !MetaphorJs.lib.Text.applicable(textStr)
                    }
                );

            MetaphorJs.dom.removeAttr(node, attrs['__attributes'][name]);
            textRenderer.subscribe(self._onTextChange, self, {
                append: [texts.length]
            });
            texts.push({
                node: node,
                attr: name,
                tr: textRenderer
            });
            self._renderText(texts.length - 1);
        },





        

        _processNode: function(node, _attrs) {

            var self        = this,
                nodeType    = node.nodeType;

            if (nodeType === nodeCmt) {
                self._processCommentNode(node);
            }
            else if (nodeType === nodeText) {
                self._processTextNode(node);
            }
            else if (nodeType === nodeElem) {

                self._resetFC();

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    fc = self._flowControlState,
                    component, directive,
                    name, ds,
                    i, len,
                    j, jlen,
                    attrs = _attrs || MetaphorJs.dom.getAttrSet(node);

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
                    self._processComponent(component, node, attrs);
                }
                else if (directive = dirs.tag[tag]) {
                    self._processTag(directive, node, attrs);
                }

                if (fc.stop) return false;
                self._checkFCState(defers, nodes, attrs);

                if (attrs.references && attrs.references.length) {
                    self._processReferences(node, attrs);
                }

                // this is an attribute directive
                for (i = 0, len = handlers.length; i < len; i++) {

                    name = handlers[i].name;

                    if ((ds = attrs['directives'][name]) !== undefined &&
                        !attrs['__directives'][name].handled) {

                        attrs.__remove(node, "directive", name);
                        attrs.__directives[name].handled = true;

                        for (j = 0, jlen = ds.length; j < jlen; j++) {
                            self._processDirAttribute(
                                node, handlers[i].handler, name, 
                                ds[j], attrs
                            );

                            if (fc.stop) return false;
                            self._checkFCState(defers, nodes, attrs);
                        }
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

        /**
         * Processes one single node and gives glues on there to go next.<br>
         * Return false to skip this branch. Do not go inside this node.<br>
         * Return a Node or array of Nodes to add to processing list
         * along with this node's children<br>
         * Return a Promise resolving in any of the above
         * @param {Node} node 
         * @param {MetaphorJs.lib.State} state
         * @returns {boolean|array|Promise|Node}
         */
        processNode: function(node, state, /*system private attr */_attrs) {
            var self = this;
            self._treeState.state = state;
            self._processNode(node, _attrs);
        },

        process: function(smth, state) {
            var self    = this;

            if (!handlers) {
                handlers = MetaphorJs.app.Directive.getAttributes();
            }
            if (!smth) {
                return;
            }

            self._treeState.state = state;

            if (smth.nodeType) {
                self._treeState.countdown++;
                self._eachNode(smth);
            }
            else {
                if (self._nodeChildren(null, smth) === 0 && 
                    self._treeState.countdown === 0) {
                    self._onProcessingFinished();
                }
            }
        },



        _nodeChildren: function(res, el) {

            var children = [],
                i, len,
                ts = this._treeState;

            if (res && res !== true) {
                if (res.nodeType) {
                    ts.countdown += 1;
                    this._eachNode(res);
                    return 1;
                }
                else {
                    children = res.slice();
                }
            }

            if (!children.length) {
                children = toArray(el.childNodes || el);
            }

            len = children.length;
            ts.countdown += len;

            for(i = -1;
                ++i < len;
                this._eachNode(children[i])){}

            return len;
        },

        _eachNode: function(el) {

            if (!el) {
                return;
            }

            var res,
                self = this,
                tag = el.nodeName,
                subState = {
                    thisLevelState: null,
                    childLevelState: null
                },
                ts = self._treeState;

            if (tag && skipMap[tag.toLowerCase()]) {
                --ts.countdown === 0 && self._onProcessingFinished();
                return;
            }

            res = self._processNode(el);

            if (ts.newState) {
                subState.thisLevelState = ts.state;
                subState.childLevelState = ts.newState;
                delete ts.newState;
            }

            isThenable(res) ?
                res.done(function(res) {
                    self._eachNodeRun(res, el, subState);
                }) :
                self._eachNodeRun(res, el, subState);
        },

        _eachNodeRun: function(res, el, sub) {
            var self = this,
                ts = self._treeState;
    
            if (res !== false) {
                sub.childLevelState && (ts.state = sub.childLevelState);
                self._nodeChildren(res, el);
                sub.thisLevelState && (ts.state = sub.thisLevelState);
            }

            --ts.countdown === 0 && self._onProcessingFinished();
        },

        _onProcessingFinished: function() {
            observer.trigger("rendered-" + this.id, this);
        },








        _onTextChange: function(textRenderer, inx) {
            this._renderText(inx);
        },

        _renderText: function(inx) {

            var self        = this,
                text        = self._texts[inx],
                res         = text.tr.getString(),
                attrName    = text.attr;

            if (res === undefined || res === null) {
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

                if (res === false) {
                    MetaphorJs.dom.removeAttr(text.node, attrName);
                }
                else {
                    MetaphorJs.dom.setAttr(text.node, attrName, res);
                }
            }
            else {
                //text.node.textContent = res;
                text.node.nodeValue = res;
            }
        },


        $destroy: function() {

            var self    = this,
                texts   = self._texts,
                i, len;

            if (self.$destroyed) {
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

            self.$destroyed = true;
        }

    });
    
    Renderer.skip = function(tag, value) {
        skipMap[tag] = value;
    };

    Renderer.applyDirective = applyDirective;

    return Renderer;

}();

