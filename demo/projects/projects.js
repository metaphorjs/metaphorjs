
(function(){

    var firebase;
    var projects;
    var getFirebase = function() {
        if (!firebase) {
            firebase   = new Firebase("https://vivid-heat-3129.firebaseio.com");
            firebase.on("value", function(data){
                projects = data;
            });
        }
        return firebase;
    };

    MetaphorJs.define("My.ProjectsView", "MetaphorJs.cmp.View", {

        route: [
            {
                reg: /\/list/,
                cmp: "My.ProjectsList",
                default: true,
                as: "ctrl"
            },
            {
                reg: new RegExp('/new'),
                cmp: "My.NewProject",
                as: "ctrl"
            },
            {
                reg: new RegExp('/edit/([^/]+)'),
                cmp: "My.EditProject",
                as: "ctrl"
            }
        ]

    });

    MetaphorJs.define("My.ProjectsList", "MetaphorJs.cmp.Component", {

        projects: null,

        // instance properties and methods
        initComponent: function() {

            var self    = this,
                projects    = [];

            self.projects.forEach(function(p){
                var record = p.val();
                record.$id = p.name();
                record.$ref = p;
                projects.push(record);
            });

            self.scope.projects = projects;
        }

    }, {
        // static properties
        template: "/metaphorjs/demo/projects/list.html",
        resolve: {
            projects: function() {

                var firebase   = getFirebase();
                var promise    = new MetaphorJs.lib.Promise;

                firebase.on("value", function(projects){
                    promise.resolve(projects);
                });

                return promise;
            }
        }
    });

    MetaphorJs.define("My.NewProject", "MetaphorJs.cmp.Component", {

        template: '/metaphorjs/demo/projects/detail.html',

        initComponent: function() {
            this.scope.project = {};
        },

        save: function() {
            var firebase = getFirebase();
            firebase.push(this.scope.project, function(){
                MetaphorJs.pushUrl('/metaphorjs/demo/projects.html');
            });
            return false;
        }
    });

    MetaphorJs.define("My.EditProject", "MetaphorJs.cmp.Component", {

        template: '/metaphorjs/demo/projects/detail.html',

        initComponent: function(cfg, projectId) {

            var self = this;

            projects.forEach(function(p){
                if (p.name() == projectId) {
                    var record = p.val();
                    record.$id = projectId;
                    record.$ref = p;
                    self.scope.project = record;
                    return false;
                }
            })

            if (!self.scope.project) {
                MetaphorJs.pushUrl("/metaphorjs/demo/projects.html");
            }
        },

        save: function() {
            var p = this.scope.project;
            p.$ref.ref().set({
                name: p.name,
                site: p.site,
                description: p.description || ""
            }, function() {
                MetaphorJs.pushUrl("/metaphorjs/demo/projects.html");
            })
        },

        remove: function() {

            this.scope.project.$ref.ref().remove(function(){
                MetaphorJs.pushUrl("/metaphorjs/demo/projects.html");
            });
        }


    });

}());