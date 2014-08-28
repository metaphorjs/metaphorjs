


var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    createWatchable = require("../../../../metaphorjs-watchable/src/func/createWatchable.js"),
    toArray = require("../../func/array/toArray.js"),
    error = require("../../func/error.js"),
    isAttached = require("../../func/dom/isAttached.js"),
    animate = require("../../func/animation/animate.js"),
    Renderer = require("../../view/Renderer.js"),
    isNull = require("../../func/isNull.js"),
    ns = require("../../../../metaphorjs-namespace/src/var/ns.js");

require("../../view/AttributeHandler.js");

registerAttributeHandler("mjs-each", 100, defineClass(null, "MetaphorJs.view.AttributeHandler", {

    model: null,
    itemName: null,
    tpl: null,
    renderers: null,
    parentEl: null,
    prevEl: null,
    nextEl: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.parseExpr(expr);

        node.removeAttribute("mjs-each");
        node.removeAttribute("mjs-include");

        self.tpl        = node;
        self.renderers  = [];
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;
        self.parentEl   = node.parentNode;

        self.node       = node;
        self.scope      = scope;

        try {
            self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);
        }
        catch (thrownError) {
            error(thrownError);
        }

        self.parentEl.removeChild(node);
        self.render(toArray(self.watcher.getValue()));
    },

    onScopeDestroy: function() {

        var self        = this,
            renderers   = self.renderers,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            renderers[i].renderer.destroy();
        }

        delete self.renderers;
        delete self.tpl;
        delete self.prevEl;
        delete self.nextEl;
        delete self.parentEl;

        self.supr();
    },

    doUpdate: function(list, start) {

        var self        = this,
            renderers   = self.renderers,
            index       = start,
            len         = renderers.length,
            last        = len - 1,
            even        = !(index % 2),
            r,
            scope;

        for (; index < len; index++) {

            r       = renderers[index];
            scope   = r.scope;

            scope.$index    = index;
            scope.$first    = index === 0;
            scope.$last     = index === last;
            scope.$even     = even;
            scope.$odd      = !even;

            even = !even;

            if (!r.renderer) {
                r.renderer  = new Renderer(r.el, r.scope);
                r.renderer.process();
            }
            else {
                scope.$check();
            }
        }

    },

    render: function(list) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            parent      = self.parentEl,
            next        = self.nextEl,
            fragment    = document.createDocumentFragment(),
            el,
            i, len;


        for (i = 0, len = list.length; i < len; i++) {

            el = tpl.cloneNode(true);
            fragment.appendChild(el);
            renderers.push(self.createItem(el, list, i));
        }

        parent.insertBefore(fragment, next);

        self.doUpdate(list, 0);
    },

    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemName,
            scope       = self.scope,
            itemScope   = scope.$new();

        itemScope[iname]    = list[index];

        return {
            el: el,
            scope: itemScope
        };
    },

    onChange: function(changes) {

        var self        = this,
            renderers   = self.renderers,
            prs         = changes.prescription || [],
            tpl         = self.tpl,
            index       = 0,
            parent      = self.parentEl,
            list        = toArray(self.watcher.getValue()),
            updateStart = null,
            el,
            i, len,
            r,
            action;

        for (i = 0, len = prs.length; i < len; i++) {
            action = prs[i];

            if (action == '-') {
                renderers[index].scope.$index = index;
                index++;
                continue;
            }

            if (isNull(updateStart)) {
                updateStart = i > 0 ? i - 1 : 0;
            }

            if (action != 'I' && renderers[index]) {

                r = renderers[index];

                r.scope.$destroy();
                // renderer will destroy itself

                animate(r.el, "leave", null, true)
                    .done(function(el){
                        isAttached(el) && el.parentNode.removeChild(el);
                    });
            }

            if (action == 'D') {
                renderers.splice(index, 1);
            }
            else {

                el  = tpl.cloneNode(true);

                animate(el, "enter", function(inx) {
                    return function(el){

                        if (inx > 0) {
                            parent.insertBefore(el, renderers[inx - 1].el.nextSibling);
                        }
                        else {
                            if (self.prevEl) {
                                parent.insertBefore(el, self.prevEl.nextSibling);
                            }
                            else {
                                parent.insertBefore(el, parent.firstChild);
                            }
                        }
                    }
                }(index), true);

                if (action == 'R') {
                    renderers[index] = self.createItem(el, list, index);
                }
                else if (action == 'I') {
                    if (i < renderers.length) {
                        renderers.splice(index, 0, self.createItem(el, list, index));
                    }
                    else {
                        renderers.push(self.createItem(el, list, index));
                    }
                }
                index++;
            }
        }

        self.doUpdate(list, updateStart);
    },

    parseExpr: function(expr) {

        var tmp = expr.split(" "),
            i, len,
            model, name,
            row;

        for (i = 0, len = tmp.length; i < len; i++) {

            row = tmp[i];

            if (row == "" || row == "in") {
                continue;
            }

            if (!name) {
                name = row;
            }
            else {
                model = tmp.slice(i).join(" ");
                break;
            }
        }

        this.model = model;
        this.itemName = name || "item";
    }

}, {
    $stopRenderer: true
}));
