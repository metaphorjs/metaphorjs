
(function(){

    MetaphorJs.cs.define("My.BufferedTableCmp", "MetaphorJs.cmp.Component", {

        initComponent: function() {

            var store = new MetaphorJs.data.Store({

                model: {
                    store: {
                        load: window.dataSource,
                        start: "start",
                        limit: "limit"
                    }
                },
                clearOnLoad: true,
                pageSize: 100

            });

            this.scope.store = store;

            window.store = store;

            store.load();

        }

    });

    MetaphorJs.cs.define("My.StaticTableCmp", "MetaphorJs.cmp.Component", {
        initComponent: function() {
            this.scope.store = window.dataSource({start: 0, limit: 1000}, true);
        }
    });


}());
