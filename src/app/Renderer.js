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
        //createText              = TextRenderer.create,
        dirs                    = MetaphorJs.directive,

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

        //rSkipTag = /^(script|template|mjs-template|style)$/i,

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

        observer = new MetaphorJs.lib.Observable;

    var Renderer = function(el, scope, parent, passedAttrs) {

        var self            = this;

        self.id             = nextUid();
        self.el             = el;
        self.scope          = scope;
        self.texts          = [];
        self.parent         = parent;
        self.passedAttrs    = passedAttrs;

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
        passedAttrs: null,
        reportFirstNode: true,

        on: function(event, fn, context, opt) {
            return observer.on(event + '-' + this.id, fn, context, opt);
        },

        once: function(event, fn, context, opt) {
            return observer.once(event + '-' + this.id, fn, context, opt);
        },

        un: function(event, fn, context) {
            return observer.un(event + '-' + this.id, fn, context);
        },

        trigger: function(event) {
            arguments[0] = event + "-" + this.id;
            return observer.trigger.apply(observer, arguments);
        },

        createChild: function(node) {
            return new Renderer(node, this.scope, this);
        },

        getEl: function() {
            return this.el;
        },

        runHandler: function(f, parentScope, node, nodeConfig, attrs) {

            var self    = this,
                scope   = f.$isolateScope ?
                            parentScope.$newIsolated() :
                          (f.$breakScope  ?
                           parentScope.$new() :
                           parentScope),
                app     = parentScope.$app,
                inject  = {
                    $scope: scope,
                    $node: node,
                    $nodeConfig: nodeConfig,
                    $attrSet: attrs,
                    $renderer: self
                },
                args    = [scope, node, nodeConfig, self, attrs],
                inst;

            if (attrs.reference) {
                scope[attrs.reference] = node;
            }

            if (app) {
                inst = app.inject(f, null, inject, args);
            }
            else if (f.$instantiate) {
                inst = f.$instantiate.apply(f, args);
            }
            else {
                inst = f.apply(null, args);
            }

            if (app && f.$registerBy && inst) {
                if (isThenable(inst)) {
                    inst.done(function(cmp){
                        app.registerCmp(cmp, parentScope, f.$registerBy);
                    });
                }
                else {
                    app.registerCmp(inst, parentScope, f.$registerBy);
                }
            }


            if (inst && inst.$destroy) {
                self.on("destroy", inst.$destroy, inst);
            }
            else if (typeof inst === "function") {
                self.on("destroy", inst);
            }

            if (f.$stopRenderer) {
                return false;
            }

            if (inst && inst.getChildren) {
                return inst.getChildren();
            }

            return inst;
        },


        processNode: function(node) {

            var self        = this,
                nodeType    = node.nodeType,
                texts       = self.texts,
                scope       = self.scope,
                textStr,
                textRenderer;

            // text node
            if (nodeType === 3) {

                textStr = node.textContent || node.nodeValue;

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
            }

            // element node
            else if (nodeType === 1) {

                if (self.reportFirstNode) {
                    observer.trigger("first-node-" + self.id, node);
                    self.reportFirstNode = false;
                }

                if (!handlers) {
                    handlers = MetaphorJs.app.Directive.getAttributes();
                }

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    i, f, len, c,
                    attrs, as, config,
                    attrProps,
                    name,
                    res,
                    handler;

                if (tag.substr(0, 4) === "mjs-") {
                    tag = tag.substr(4);
                }

                attrs = MetaphorJs.dom.getAttrSet(node);

                if (attrs.config.ignore) {
                    return false;
                }

                config = new MetaphorJs.lib.Config(attrs.config, {
                    scope: self.scope
                });                

                if (self.passedAttrs) {
                    attrs['directive'] = extend(
                        {}, 
                        attrs['directive'], 
                        self.passedAttrs['directive'], 
                        true, true
                    );
                    self.passedAttrs = null;
                }

                // this tag represents component
                // we just pass it to attr.cmp directive
                // by adding it to the attr map
                if (c = dirs.component[tag]) {

                    as = attrs.config.tag ? attrs.config.tag.expression : null;

                    if (as) {

                        attrs["directive"]['cmp'] = {
                            name: "cmp",
                            original: "{cmp}",
                            config: extend({}, attrs.config, {
                                value: {
                                    mode: MetaphorJs.lib.Config.MODE_STATIC,
                                    expression: c.prototype.$class
                                }
                            })
                        };

                        as = window.document.createElement(as);
                        node.parentNode.replaceChild(as, node);
                        while (node.firstChild) {
                            as.appendChild(node.firstChild);
                        }
                        node = as;
                        for (name in attrs.rest) {
                            MetaphorJs.dom.setAttr(node, name, attrs.rest[name]);
                        }
                    }
                    else {

                        f = dirs.attr.cmp;
                        delete attrs['directive']['cmp'];

                        /*var passAttrs = extend({}, attrs);
                        delete passAttrs['directive']['cmp'];
                        attrs.config.passAttrs = passAttrs;*/

                        config = new MetaphorJs.lib.Config(
                            extend({}, attrs.config, {
                                value: {
                                    mode: MetaphorJs.lib.Config.MODE_STATIC,
                                    expression: c
                                }
                            }, true, false),
                            {scope: self.scope}
                        );
                        self.on("destroy", config.$destroy, config);

                        res = self.runHandler(f, scope, node, config, attrs);

                        if (res === false) {
                            return false;
                        }
                        if (isThenable(res)) {
                            defers.push(res);
                        }
                        else {
                            collectNodes(nodes, res);
                        }
                    }
                }

                // this is a tag directive
                else if (f = dirs.tag[tag]) {

                    config = new MetaphorJs.lib.Config(
                        attrs.config, 
                        {scope: self.scope, deferInit: true}
                    );
                    self.on("destroy", config.$destroy, config);
                    res = self.runHandler(f, scope, node, config, attrs);

                    attrs.removeDirective(node, tag);

                    if (res === false) {
                        return false;
                    }
                    if (isThenable(res)) {
                        defers.push(res);
                    }
                    else {
                        collectNodes(nodes, res);
                    }
                }


                // this is an attribute directive
                for (i = 0, len = handlers.length; i < len; i++) {
                    name    = handlers[i].name;

                    if ((attrProps = attrs['directive'][name]) !== undf &&
                        !attrProps.handled) {

                        handler = handlers[i].handler;

                        if (!handler.$keepAttribute) {
                            MetaphorJs.dom.removeAttr(node, attrProps.original);
                        }
                        attrs.removeDirective(node, name);

                        config = new MetaphorJs.lib.Config(
                            attrProps.config, 
                            {scope: self.scope}
                        );
                        self.on("destroy", config.$destroy, config);
                        res     = self.runHandler(handler, scope, node, config, attrs);

                        attrProps.handled = true;

                        if (res === false) {
                            return false;
                        }
                        if (isThenable(res)) {
                            defers.push(res);
                        }
                        else {
                            collectNodes(nodes, res);
                        }
                    }
                }

                if (attrs.reference) {
                    if (attrs.reference[0] === '#') {
                        observer.trigger(
                            "reference-" + self.id, 
                            "node",
                            attrs.reference.substring(1),
                            node
                        );
                    }
                    else {
                        scope[attrs.reference] = node;
                    }
                    MetaphorJs.dom.removeAttr(node, '#' + attrs.reference);
                }

                if (defers.length && !attrs.config.ignoreInside) {
                    var deferred = new MetaphorJs.lib.Promise;
                    MetaphorJs.lib.Promise.all(defers).done(function(values){
                        collectNodes(nodes, values);
                        deferred.resolve(nodes);
                    });
                    return deferred;
                }

                // this is a plain attribute
                for (i in attrs['attribute']) {

                    textStr = attrs['attribute'][i].value;
                    textRenderer = new MetaphorJs.lib.Text(self.scope, textStr, {
                        recursive: !!attrs.config.recursive,
                        fullExpr: !MetaphorJs.lib.Text.applicable(textStr)
                    });

                    MetaphorJs.dom.removeAttr(node, attrs['attribute'][i].original);
                    textRenderer.subscribe(self.onTextChange, self, {
                        append: [texts.length]
                    });
                    texts.push({
                        node: node,
                        attr: i,
                        tr: textRenderer
                    });
                    self.renderText(texts.length - 1);
                }

                if (attrs.config.ignoreInside) {
                    if (defers.length) {
                        var deferred = new MetaphorJs.lib.Promise;
                        MetaphorJs.lib.Promise.all(defers).done(function(){
                            return deferred.resolve(false);
                        });
                        return deferred;
                    }
                    else {
                        return false;
                    }
                }

                return nodes.length ? nodes : true;
            }

            return true;
        },

        process: function() {
            var self    = this;

            if (self.el.nodeType) {
                eachNode(self.el, self.processNode, self,
                    self.onProcessingFinished, {countdown: 1});
            }
            else {
                nodeChildren(
                    null, self.el, self.processNode,
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

            for (i = -1, len = texts.length; ++i < len; texts[i].tr.$destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.$destroy, self);
            }

            observer.trigger("destroy-" + self.id);
        }

    });
    
    Renderer.skip = function(tag, value) {
        skipMap[tag] = value;
    };

    return Renderer;

}();

