

describe("MetaphorJs.app", function(){

    it("initApp", function(done){

        var div = document.createElement("div");
        div.setAttribute("mjs-app", "");
        document.body.appendChild(div);
        MetaphorJs.initApp(div, null, null, true).done(function(){
            done();
        });
    });

    it("renderText", function(done){


        var app = document.createElement("div");
        app.setAttribute("mjs-app", "");
        document.body.appendChild(app);

        var div = document.createElement("div");
        div.setAttribute("mjs-init", ".a = 1");
        div.innerHTML = '{{.a}}';
        app.appendChild(div);

        MetaphorJs.initApp(app, null, null, true).then(function(){
            expect(div.innerHTML).to.equal("1");
            done();
        });
    });

    it("should compile text", function(){

        var scope = new MetaphorJs.lib.Scope;
        scope.a = 1;

        var fragment = MetaphorJs.compile("<div>{{.a}}</div>", scope);

        expect(fragment.childNodes[0].innerHTML).to.equal("1");

    });

});