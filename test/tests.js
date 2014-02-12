$(function(){

    MetaphorJs.define("Haverything.Test", "MetaphorJs.cmp.Component", {

        renderTo: "body",
        initComponent: function() {
            this.html   = "test";
        }
    });

    MetaphorJs.define("Haverything.Test1", "Haverything.Test", {

        initComponent: function() {
            this.supr();
            this.html   += "1";
        }
    });


    var test = MetaphorJs.create("Haverything.Test");
    var test1 = new Haverything.Test1;


    var cmp1        = MetaphorJs.create("MetaphorJs.cmp.Component");
    cmp1.render("body");
    var objStore    = MetaphorJs.create("MetaphorJs.data.Store", {
        url:    "data.json",
        autoLoad: true,
        callback: {
            load: function() {

                var html    = "";

                objStore.each(function(obj){
                    html    += obj.id + " - " + obj.name + "<br>";
                });

                cmp1.setContent(html);
            }
        }
    });

    var cmp2        = MetaphorJs.create("MetaphorJs.cmp.Component");
    cmp2.render("body");
    var recStore   = MetaphorJs.create("MetaphorJs.data.Store", {
        url: "data.json",
        autoLoad: true,
        recordType: "MetaphorJs.data.Record",
        callback: {
            load: function() {

                var html    = "";

                recStore.each(function(rec){
                    html    += rec.getId() + " - " + rec.get("name") + "<br>";
                });

                cmp2.setContent(html);
            }
        }
    });

});