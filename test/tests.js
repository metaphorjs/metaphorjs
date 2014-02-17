$(function(){

    var M = MetaphorJs;

    M.d("Haverything.Test", "MetaphorJs.cmp.Component", {

        renderTo: "body",
        initComponent: function() {
            this.html   = "test";
        }
    });

    M.d("Haverything.Test1", "Haverything.Test", {

        initComponent: function() {
            this.supr();
            this.html   += "1";
        }
    });


    var test = M.c("Haverything.Test");
    var test1 = new Haverything.Test1;


    var cmp1        = M.c("MetaphorJs.cmp.Component");
    cmp1.render("body");
    var objStore    = M.c("MetaphorJs.data.Store", {
        url:    "data.json",
        autoLoad: true,
        model: {
            data: "record"
        },
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

    var cmp2        = M.c("MetaphorJs.cmp.DataList", {
        store: M.create("MetaphorJs.data.Store", {
            model: {
               type: "MetaphorJs.data.Record",
               id: "id",
               data: "record",
               store: {
                   load: "data.json",
                   save: {
                       url: "data.json",
                       type: "GET"
                   },
                   delete: {
                       url: "data.json",
                       type: "GET"
                   }
               }
            },
            autoLoad: true,
            callback: {
                load: function(store) {
                    window.setTimeout(function(){
                        store.add({id: 3, name: "Record 3"});

                        window.setTimeout(function(){
                            store.removeId(3);
                            console.log("first save - nothing");
                            try {
                                store.save();
                            }
                            catch (e) {}
                            console.log("second save - post");
                            store.getAt(0).set("name", "new name");

                            store.save().then(function(){
                                console.log("delete after save");
                                store.deleteRecords(store.getRange());
                            });
                        }, 2000);
                    }, 1000);
                }
            }
        }),
        tag: 'ul',
        itemSelector: "li",
        itemTpl: '<li data-id="{id}">{name}</li>'
    });
    cmp2.render("body");

    var rec     = M.c("MetaphorJs.data.Record", 10, {
        model: {
            id:     "id",
            record: {
                load:   "record.json",
                save:   {
                    url: "record.json",
                    type: "GET"
                },
                delete: {
                    url: "record.json",
                    type: "GET"
                }
            }
        },
        callback: {
            change: function(rec) {
                test.setContent(rec.get("name"));
            },
            load: function(rec) {
                test.setContent(rec.get("name"));

                rec.set("name", "new name");
                rec.once("save", rec.delete, rec);
                rec.save();
            }
        }
    });
});