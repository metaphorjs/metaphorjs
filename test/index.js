
var defineClass = MetaphorJs.define;

defineClass("Test.MyApp2", "MetaphorJs.cmp.App", {

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

        self.scope.linkified = 'Linkified text aaa http://www.kuindji.com bbb';

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

},{
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



defineClass("Test.MyView", "MetaphorJs.cmp.View", {

        route: [
            {
                reg: /^\/1$/,
                cmp: "Test.MyComponent"
            },
            {
                reg: /^\/2\/(\d+)$/,
                params: ["param"],
                cmp: "Test.MyComponent2"
            },
            {
                reg: /^\/2$/,
                cmp: "Test.MyComponent2"
            },
            {
                reg: /^\/3$/,
                template: "a+b"
            }
        ]
    });

defineClass("Test.MyRecord", "MetaphorJs.data.Record", {});

defineClass("Test.MyComponent", "MetaphorJs.cmp.Component", {

        initComponent: function() {

            var self    = this;

            self.scope.title = "My Component" + (new Date).getTime();

            var model   = new MetaphorJs.data.Model({
                type: "Test.MyRecord",
                id: "id",
                data: "record",
                total: "total",
                store: {
                    load: "/metaphorjs/test/data.json"
                }
            });

            self.scope.store = new MetaphorJs.data.Store({
                model: model
            });

            self.scope.deferred = self.deferred;
        },

        afterRender: function() {

            if (this.para && window.console && window.console.log) {
                console.log("got child property 'para': ", this.para);
            }
        },

        reverse: function() {
            var title   = this.scope.title;
            this.scope.title    = title.split("").reverse().join('');
        },

        createNew: function() {

            var node    = document.getElementById("newComponent");
            MetaphorJs.resolveComponent("Test.DynamicComponent", {}, this.scope, node);
        },

        createRender: function() {

            var to  = document.getElementById("renderToComponent");
            MetaphorJs.resolveComponent("Test.DynamicComponent", {renderTo: to}, this.scope);
        },

        createDialog: function() {


            try {
                var dialog = new MetaphorJs.cmp.Dialog({
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
                    as: "dlg",
                    scope: this.scope,
                    template: '<p>This is a dialog. <a href="#" mjs-click=".dlg.hide()">close</a></p>'
                });
                dialog.show();
            }
            catch(e) {
                MetaphorJs.error(e)
            }

        },

        loadStore: function() {
            this.scope.store.load().done(function(){
                this.scope.$check();
            }, this);
        }
    }, {
        template: "cmp1-template",
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

defineClass("Test.MyComponent2", "MetaphorJs.cmp.Component", {

        template: 'cmp1-template',

        initComponent: function(cfg, param) {
            var self    = this;

            if (cfg.param) {
                alert("received param: " + cfg.param);
            }
            self.scope.title = "My Component2 " + (new Date).getTime();
        }
    });

defineClass("Test.TplComponent", "MetaphorJs.cmp.Component", {

        initComponent: function() {

            var self    = this;

            self.scope.title= "Tpl Component";
            self.scope.tpl  = "a+b";

            self.scope.$app.onAvailable("myComponent1").done(function(cmp){
                if (window.console && window.console.log) {
                    console.log("on available myComponent1");
                }
            });
        }

    });

defineClass("Test.StringTemplate", "MetaphorJs.cmp.Component", {}, {
        template: '<p>This template is inlined in components definition ({{.$root.a}})</p>'
    });

defineClass("Test.DynamicComponent", "MetaphorJs.cmp.Component", {}, {
        template: '<p>This component was created dynamically</p><div mjs-transclude></div>'
    });

defineClass("Test.ChangeTemplate", "MetaphorJs.cmp.Component", {

        template: '.tpl',

        initComponent: function() {

            var scope = this.scope;

            scope.tpl1 = '<p>Template 1</p><div mjs-transclude></div>';
            scope.tpl2 = '<p>Template 2</p><div mjs-transclude></div>';

            scope.tpl = scope.tpl1;
        }
    });

defineClass("Test.ViewComponent1", "MetaphorJs.cmp.Component", {
        template: '<p>View template 1</p><div mjs-transclude></div>'
    });

defineClass("Test.ViewComponent2", "MetaphorJs.cmp.Component", {
        template: '<p>View template 2</p><div mjs-transclude></div>'
    });




MetaphorJs.onReady(function(){
    var dataObj     = {
        header: "header",
        text: "text",
        subtext: "subtext",
        rootText: "root text",
        a: 1,
        b: 2,
        bool: true,
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

    //console.profile();
    MetaphorJs.initApp(document.getElementById("render"), null, dataObj)
        .done(function(app){
            app.value("test", "123");
            app.run();
        });

    //console.profileEnd();

    var end  = (new Date).getTime();

    if (window.console) {
        console.log("render time: ", end - start);
    }

});
