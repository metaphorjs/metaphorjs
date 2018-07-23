


var animate = require("metaphorjs-animate/src/func/animate.js"),
    Directive = require("../../class/Directive.js");


Directive.registerAttribute("if", 500, Directive.$extend({

    $class: "Directive.attr.If",
    parentEl: null,
    prevEl: null,
    nextEl: null,
    el: null,
    initial: true,
    cfg: null,
    animate: false,

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this;

        self.createCommentHolders(node, this.$class);

        //self.parentEl   = node.parentNode;
        self.cfg        = attr ? attr.config : {};
        self.animate    = !!self.cfg.animate;

        self.$super(scope, node, expr, renderer, attr);
    },

    onScopeDestroy: function() {

        var self    = this;

        self.prevEl = null;
        //self.parentEl = null;
        self.nextEl = null;

        self.$super();
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult(),
            parent  = self.prevEl.parentNode,
            node    = self.node;

        var show    = function(){
            parent.insertBefore(node, self.nextEl);
        };

        var hide    = function() {
            parent.removeChild(node);
        };

        if (val) {
            self.initial || !self.animate ?
                show() : animate(node, "enter", show);
        }
        else {
            if (node.parentNode) {
                self.initial || !self.animate ?
                    hide() : animate(node, "leave").done(hide);
            }
        }

        self.$super(val);

        if (self.initial) {
            self.initial = false;
        }
        else {
            if (self.cfg.once) {
                self.$destroy();
            }
        }
    }

}));
