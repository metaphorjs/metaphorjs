
(function(){

    var projects;
    var getFirebase = function() {
        var firebase   = new Firebase("https://vivid-heat-3129.firebaseio.com");
        firebase.on("value", function(data){
            projects = data;
        });
        return firebase;
    };

    var getProjects = ['$firebase', function(firebase) {
        var promise    = new MetaphorJs.lib.Promise;

        firebase.on("value", function(projects){
            promise.resolve(projects);
        });

        return promise;
    }];

    MetaphorJs.define("My.App", "MetaphorJs.cmp.App", {

        initApp: function() {
            this.factory("$firebase", getFirebase, true);
            this.factory("$projects", getProjects);
        }

    });

    MetaphorJs.define("My.ProjectsView", "MetaphorJs.cmp.View", {

        route: [
            {
                reg: new RegExp('/list'),
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
                params: ['projectId'],
                cmp: "My.EditProject",
                as: "ctrl"
            }
        ]

    });

    MetaphorJs.define("My.ProjectsList", "MetaphorJs.cmp.Component", {

        // instance properties and methods
        initComponent: function(cfg, fProjects) {

            var self    = this,
                projects    = [];

            fProjects.forEach(function(p){
                var record = p.val();
                record.$id = p.name();
                record.$ref = p;
                projects.push(record);
            });

            self.scope.projects = projects;
        }

    }, {
        templateUrl: "/metaphorjs/demo/projects/list.html",
        inject: ['$config', '$projects']
    });


    MetaphorJs.define("My.NewProject", "MetaphorJs.cmp.Component", {

        firebase: null,
        templateUrl: '/metaphorjs/demo/projects/detail.html',

        initComponent: function(cfg, firebase) {

            this.firebase = firebase;
            this.scope.project = {};
        },

        save: function() {
            this.firebase.push(this.scope.project, function(){
                MetaphorJs.pushUrl('/metaphorjs/demo/projects.html');
            });
            return false;
        }
    }, {
        inject: ['$config', '$firebase']
    });

    MetaphorJs.define("My.EditProject", "MetaphorJs.cmp.Component", {

        initComponent: function(cfg, projects, projectId) {

            var self = this;

            projects.forEach(function(p){
                if (p.name() == projectId) {
                    var record = p.val();
                    record.$id = projectId;
                    record.$ref = p;
                    self.scope.project = record;
                    return false;
                }
            });

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
    }, {
        templateUrl: '/metaphorjs/demo/projects/detail.html',
        inject: ['$config', '$projects', 'projectId']
    });

}());