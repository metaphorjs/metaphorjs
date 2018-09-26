

var nextUid = require("../func/nextUid.js"),
    isArray = require("../func/isArray.js"),
    toArray = require("../func/array/toArray.js"),
    isThenable = require("../func/isThenable.js"),
    Scope = require("../lib/Scope.js"),
    Directive = require("./Directive.js"),
    MetaphorJs = require("../MetaphorJs.js"),
    TextRenderer = require("./TextRenderer.js"),
    slice = require("../func/array/slice.js"),
    setAttr = require("../func/dom/setAttr.js"),
    removeAttr = require("../func/dom/removeAttr.js"),
    getAttrSet = require("../func/dom/getAttrSet.js"),
    extend = require("../func/extend.js"),
    undf = require("../var/undf.js"),

    Observable = require("metaphorjs-observable/src/lib/Observable.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    cls = require("metaphorjs-class/src/cls.js");

require("../func/array/aIndexOf.js");

module.exports = function(){

    var handlers                = null,
        createText              = TextRenderer.create,
        dirs                    = MetaphorJs.directive,

        lookupDirective = function(name) {
            return !!dirs.attr[name];
        },

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
                    children = slice.call(res);
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

        observer = new Observable;

    return cls({

        $class: "MetaphorJs.Renderer",

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,
        passedAttrs: null,
        reportFirstNode: true,

        $init: function(el, scope, parent, passedAttrs) {
            var self            = this;

            self.id             = nextUid();
            self.el             = el;
            self.scope          = scope;
            self.texts          = [];
            self.parent         = parent;
            self.passedAttrs    = passedAttrs;

            if (scope instanceof Scope) {
                scope.$on("destroy", self.$destroy, self);
            }

            if (parent) {
                parent.on("destroy", self.$destroy, self);
            }
        },

        on: function(event, fn, context) {
            return observer.on(event + '-' + this.id, fn, context);
        },

        once: function(event, fn, context) {
            return observer.once(event + '-' + this.id, fn, context);
        },

        un: function(event, fn, context) {
            return observer.un(event + '-' + this.id, fn, context);
        },

        createChild: function(node) {
            return new Renderer(node, this.scope, this);
        },

        getEl: function() {
            return this.el;
        },

        runHandler: function(f, parentScope, node, attr, attrs) {

            var self    = this,
                scope   = f.$isolateScope ?
                            parentScope.$newIsolated() :
                          (f.$breakScope  ?
                           parentScope.$new() :
                           parentScope),
                app     = parentScope.$app,
                value   = attr ? attr.value : null,
                // attribute directives receive mods,
                // tag directives receive cmpConfig
                inject  = {
                    $scope: scope,
                    $node: node,
                    $attr: attr,
                    $attrValue: value,
                    $attrMap: attrs,
                    $renderer: self
                },
                args    = [scope, node, value, self, attr],
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
                textRenderer;

            // text node
            if (nodeType === 3) {
                textRenderer    = createText(
                    scope,
                    node.textContent || node.nodeValue,
                    {userData: texts.length});

                if (textRenderer) {
                    textRenderer.subscribe(self.onTextChange, self);
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
                    handlers = Directive.getAttributes();
                }

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    i, l, f, len, c,
                    attrs, as,
                    attrProps,
                    name,
                    res,
                    handler,
                    someHandler = false;

                if (tag.substr(0, 4) === "mjs-") {
                    tag = tag.substr(4);
                }

                attrs = getAttrSet(node, lookupDirective);

                if (attrs.config.ignore) {
                    return false;
                }

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

                    as = attrs.config.as || c.tag;

                    if (as) {

                        attrs["directive"]['cmp'] = {
                            value: c.prototype.$class,
                            name: "cmp",
                            original: "{cmp}",
                            config: extend({}, attrs.config),
                            values: null
                        };

                        as = window.document.createElement(as);
                        node.parentNode.replaceChild(as, node);
                        while (node.firstChild) {
                            as.appendChild(node.firstChild);
                        }
                        node = as;
                        for (name in attrs.rest) {
                            setAttr(node, name, attrs.rest[name]);
                        }
                    }
                    else {

                        f = dirs.attr.cmp;
                        var passAttrs = extend({}, attrs);
                        delete passAttrs['directive']['cmp'];

                        attrs.config.passAttrs = passAttrs;

                        res = self.runHandler(f, scope, node, {
                            value: c,
                            config: attrs.config
                        }, attrs);
                        someHandler = true;

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

                    res = self.runHandler(
                        f, scope, node, 
                        {value: null, config: attrs.config}, 
                        attrs
                    );
                    someHandler = true;

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
                            removeAttr(node, attrProps.original);
                        }
                        attrs.removeDirective(node, name);

                        res     = self.runHandler(handler, scope, node, attrProps, attrs);

                        someHandler = true;
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

                if (!someHandler && attrs.reference) {
                    scope[attrs.reference] = node;
                }

                if (defers.length && !attrs.config.ignoreInside) {
                    var deferred = new Promise;
                    Promise.all(defers).done(function(values){
                        collectNodes(nodes, values);
                        deferred.resolve(nodes);
                    });
                    return deferred;
                }

                // this is a plain attribute
                for (i in attrs['attribute']) {

                    textRenderer = createText(
                        scope,
                        attrs['attribute'][i].value,
                        {userData: texts.length, force: true});

                    removeAttr(node, attrs['attribute'][i].original);
                    textRenderer.subscribe(self.onTextChange, self);
                    texts.push({
                        node: node,
                        attr: i,
                        //attrProp: attrs['attribute'][i],
                        tr: textRenderer
                    });
                    self.renderText(texts.length - 1);
                }

                if (attrs.config.ignoreInside) {
                    if (defers.length) {
                        var deferred = new Promise;
                        return Promise.all(defers).done(function(){
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

                setAttr(text.node, attrName, res);
            }
            else {
                //text.node.textContent = res;
                text.node.nodeValue = res;
            }
        },


        onDestroy: function() {

            var self    = this,
                texts   = self.texts,
                i, len;

            for (i = -1, len = texts.length; ++i < len; texts[i].tr.$destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.$destroy, self);
            }

            observer.trigger("destroy-" + self.id);
        }

    }, {

        setSkip: function(tag, value) {
            skipMap[tag] = value;
        }
    });

}();

