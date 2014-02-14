

$(function(){

    MetaphorJs.define("MetaphorJs.data.MyRecord", "MetaphorJs.data.Record", {});

    MetaphorJs.define("MetaphorJs.data.MyModel", "MetaphorJs.data.Model", {

        type:   "MetaphorJs.data.MyRecord",
        id: "id",
        data: "record",

        record: {
            save: "dummy.php",
            delete: "dummy.php"
        },

        store: {
            load: "store.json",
            save: "dummy.php",
            delete: "dummy.php"
        }
    });

    var store   = MetaphorJs.create("MetaphorJs.data.Store", {
        autoLoad: true,
        model: "MetaphorJs.data.MyModel"
    });

    var list    = MetaphorJs.create("MetaphorJs.cmp.DataList", {
        store: store,
        tag: 'table',
        itemSelector: "tr",
        itemTpl: '<tr data-id="{id}">'+
                    '<td>{id}</td>'+
                    '<td><input class="input" value="{name}"/></td>'+
                    '<td><input type="button" value="Delete" class="delete"/></td>'+
                     '<td><input type="button" value="Remove" class="remove"/></td>'+
                    '</tr>'
    });

    var store1   = MetaphorJs.create("MetaphorJs.data.Store", {
        autoLoad: true,
        model: "MetaphorJs.data.MyModel"
    });

    var list1    = MetaphorJs.create("MetaphorJs.cmp.DataList", {
        store: store1,
        tag: 'table',
        itemSelector: "tr",
        itemTpl: '<tr data-id="{id}">'+
                   '<td>{id}</td>'+
                   '<td><input class="input" value="{name}"/></td>'+
                   '<td><input type="button" value="Delete" class="delete"/></td>'+
                   '<td><input type="button" value="Remove" class="remove"/></td>'+
            '</tr>'
    });

    $("body").delegate(".remove", "click", function(e){
        var list    = $(e.target).getParentCmp(),
            rec     = list.getRecordByEvent(e);
        if (rec) {
            list.getStore().remove(rec);
        }
    });
    $("body").delegate(".delete", "click", function(e){
        var list    = $(e.target).getParentCmp(),
            rec     = list.getRecordByEvent(e);
        if (rec) {
            list.getStore().delete(rec);
        }
    });
    $("body").delegate(".input", "keyup", function(e){
        var list    = $(e.target).getParentCmp(),
            rec     = list.getRecordByEvent(e),
            input   = $(e.target);

        if (rec) {
            rec.set("name", input.val());
        }
    });

    store.on("update", function(store,rec){
        var el  = list.getElById(rec.getId());
        el.css("background-color", rec.isDirty() ? "#f0f0f0" : "transparent");
        el.find(".input").val(rec.get("name"));
    });

    store1.on("update", function(store,rec){
        var el  = list1.getElById(rec.getId());
        el.css("background-color", rec.isDirty() ? "#f0f0f0" : "transparent");
        el.find(".input").val(rec.get("name"));
    });

    list.render("body");
    list1.render("body");

});