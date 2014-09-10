

MetaphorJs.cs.define("My.TableCmp", "MetaphorJs.cmp.Component", {

    initComponent: function() {

        var store = new MetaphorJs.data.Store({

            model: {
                   store: {
                          load: {
                                url: "http://127.0.0.1:3001",
                                crossDomain: true,
                                jsonp: true
                          },
                          start: "start",
                          limit: "limit"
                   }
            },
            clearOnLoad: true,
            pageSize: 50

        });

        this.scope.store = store;

        window.store = store;

        store.load();

    }

});