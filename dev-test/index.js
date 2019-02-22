
require("../src/app/App.js");
require("../src/app/view/Router.js");
require("../src/app/Component.js");
require("../src/app/Container.js");
require("../src/func/app/resolve.js");
require("../src/func/app/init.js");
require("../src/func/dom/onReady.js");
require("metaphorjs-dialog/src/dialog/Component.js");
require("metaphorjs-model/src/model/Model.js");
require("metaphorjs-model/src/model/Record.js");
require("metaphorjs-model/src/model/Store.js");
require("metaphorjs-promise/src/lib/Promise.js");

var cls = require("metaphorjs-class/src/cls.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

var Test = {};

ns.register("Test", Test);

cls({

    $class: "Test.MyApp2",
    $extends: "MetaphorJs.app.App",

    initApp: function(node, scope, someValue) {

        var self    = this;
        var level2Inx = 0;
        var level2  = [
            '(level 3 value: {{.b}})',
            '(level 3 value: {{.c}})'
        ];

        self.scope.resolved = someValue;

        self.scope.level1   = '[ and here comes level 2: {{.level2}} ]';
        self.scope.level2   = level2[level2Inx];

        self.scope.b        = 1;
        self.scope.c        = "variable c";

        self.scope.changeLevel2 = function(inx) {
            level2Inx = level2Inx == 0 ? 1 : 0;
            self.scope.level2 = level2[level2Inx];
        };

        self.scope.increaseB = function() {
            self.scope.b++;
        };

        self.scope.people = 0;

        self.lang.setLocale("ru");
        self.lang.set("key", "text value");
        self.lang.set("plr", ["котик", "котика", "котиков"]);
        self.lang.set("subkey1", 'subkey: {{\'subkey2\' | l}}');
        self.lang.set('subkey2', 'text value');

        self.lang.set("viewing", {
            '0': 'Nobody is viewing',
            '1': 'One person is viewing',
            '2': 'Two people are viewing',
            other: '{{.people}} people are viewing',
            negative: ""
        });
    }

}, {
    inject: ['$node', '$scope', 'someValue'],
    resolve: {
        someValue: function() {
            var p = new MetaphorJs.lib.Promise;
            setTimeout(function(){
                p.resolve((new Date).getTime());
            }, 100);
            return p;
        }
    }
});



cls({

    $class: "Test.MyView",
    $extends: "MetaphorJs.app.view.Router",
    route: [
        {
            template: 'test-template.html',
            "default": true
        },
        {
            regexp: /^\/1$/,
            cmp: "Test.MyComponent"
        },
        {
            regexp: /^\/2\/(\d+)$/,
            params: ["param"],
            cmp: "Test.MyComponent2"
        },
        {
            regexp: /^\/2$/,
            cmp: "Test.MyComponent2"
        },
        {
            regexp: /^\/3$/,
            template: "a+b.html"
        }
    ]
});

cls({
    $class: "Test.MyRecord",
    $extends: "MetaphorJs.model.Record"
});

cls({

    $class: "Test.MyComponent",
    $extends: "MetaphorJs.app.Component",
    template: "cmp1-template.html",
    config: {
        makeTranscludes: true
    },

        initComponent: function() {

            var self    = this;

            self.scope.title = "My Component" + (new Date).getTime();

            var model   = new MetaphorJs.model.Model({
                type: "Test.MyRecord",
                id: "id",
                root: "record",
                total: "total",
                store: {
                    load: "data.json"
                }
            });

            self.scope.store = new MetaphorJs.model.Store({
                model: model
            });

            self.scope.deferred = self.deferred;
        },

        afterRender: function() {
            if (this.$refs.node.para) {
                console.log("got child property 'para': ", this.$refs.node.para);
            }
        },

        reverse: function() {
            var title   = this.scope.title;
            this.scope.title    = title.split("").reverse().join('');
        },

        createNew: function() {
            var node    = document.getElementById("newComponent");
            MetaphorJs.app.resolve(
                "Test.DynamicComponent", 
                {autoRender: true, scope: this.scope}, 
                node
            );
        },

        createRender: function() {
            var to  = document.getElementById("renderToComponent");
            MetaphorJs.app.resolve(
                "Test.DynamicComponent", 
                {autoRender: false, scope: this.scope}
            )
            .done(function(cmp){
                cmp.render(to)
            });
        },

        createDialog: function() {

            var dialog = new MetaphorJs.dialog.Component({
                id: "small-dialog",
                dialogCfg: {
                    cls: {
                        dialog: "dialog"
                    },
                    position: "wc",
                    show: {
                        animate: true
                    },
                    hide: {
                        destroy: true
                    }
                },
                config: {
                    tag: "div",
                    as: "dlg"
                },
                renderTo: window.document.body,
                scope: this.scope,
                template: {
                    html: '<p>This is a dialog. <a href="#" (click)="this.dlg.hide()">close</a></p>'
                }
            });
            dialog.show();
        },

        loadStore: function() {
            this.scope.store.load()
                .done(function(){this.scope.$check();}, this)
                .fail(function(reason){
                    console.log('failed', reason)
                });
        }
    }, {
        resolve: {
            deferred: ['$node', '$scope', 'test', function(node, scope, test) {
                return new MetaphorJs.lib.Promise(function(resolve, reject){
                    setTimeout(function(){
                        resolve((new Date).getTime());
                    }, 1000);
                });
            }]
        }
    });

cls({

    $class: "Test.MyComponent2",
    $extends: "MetaphorJs.app.Component",
    template: 'cmp1-template.html',
    config: {
        makeTranscludes: true
    },

    initComponent: function(cfg, param) {
        var self    = this;

        if (cfg.param) {
            alert("received param: " + cfg.param);
        }
        self.scope.title = "My Component2 " + (new Date).getTime();
    }
});

cls({

    $class: "Test.TplComponent",
    $extends: "MetaphorJs.app.Component",
    config: {
        makeTranscludes: true
    },

    initComponent: function() {

        var self    = this;

        self.scope.title= "Tpl Component";
        self.scope.tpl  = "a+b.html";

        self.scope.$app.onAvailable("myComponent1").done(function(cmp){
            if (window.console && window.console.log) {
                console.log("on available myComponent1");
            }
        });
    }
});

cls({
    $class: "Test.StringTemplate",
    $extends: "MetaphorJs.app.Component",
    config: {
        makeTranscludes: true
    },
    template: {
        html: '<p>This template is inlined in components definition ({{this.$root.a}})</p>'
    }
});

cls({
    $class: "Test.DynamicComponent",
    $extends: "MetaphorJs.app.Component",
    config: {
        makeTranscludes: true
    },
    template: {
        html: '<p>This component was created dynamically</p><div {transclude}></div>'
    }
});

cls({

    $class: "Test.ChangeTemplate",
    $extends: "MetaphorJs.app.Component",
    config: {
        makeTranscludes: true
    },
    template: {
        html: {
            expression: 'this.tpl'
        }
    },

    initComponent: function() {

        var scope = this.scope;

        scope.tpl1 = '<p>Template 1</p><div {transclude}></div>';
        scope.tpl2 = '<p>Template 2</p><div {transclude}></div>';

        scope.tpl = scope.tpl1;
    }
});

cls({
    $class: "Test.ViewComponent1",
    $extends: "MetaphorJs.app.Component",
    config: {
        makeTranscludes: true
    },
    template: {
        html: '<p>View template 1</p><div {transclude}></div>'
    }
});

cls({
    $class: "Test.ViewComponent2",
    $extends: "MetaphorJs.app.Component",
    config: {
        makeTranscludes: true
    },
    template: {
        html: '<p>View template 2</p><div {transclude}></div>'
    }
});


cls({
    $class: "Test.TagComponent",
    config: {
        makeTranscludes: true
    },
    $extends: "MetaphorJs.app.Component",
    $alias: "MetaphorJs.directive.component.tagc",
    template: "tagc.html"
});


MetaphorJs.app.Template.cache.addFinder(function(name){
    if (name) {
        return MetaphorJs.app.Template.load(name, name);
    }
});

MetaphorJs.dom.onReady(function(){
    var dataObj     = {
        linkified: 'Linkified text aaa http://www.kuindji.com bbb',
        newItem: "",
        date: new Date,
        num: 10000,
        list: [
            {bool: true, txt: "item 1"},
            {bool: false, txt: "item 2"},
            {bool: false, txt: "item 3"}
        ]
    };
    var start  = (new Date).getTime();
    var el = document.getElementById("render");

    if (el) {

        //console.profile();
        MetaphorJs.app.init(el, null, dataObj, false)
            .done(function (app) {
                app.value("test", "123");
                app.run();
                window.mainApp = app;
                window.MetaphorJs = MetaphorJs;
            });
        //console.profileEnd();

        var end = (new Date).getTime();

        if (window.console) {
            console.log("render time: ", end - start);
        }
    }

});





window.MetaphorJs = MetaphorJs;