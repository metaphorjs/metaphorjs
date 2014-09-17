
(function(){

    MetaphorJs.cs.define("My.BufferedTableCmp", "MetaphorJs.cmp.Component", {

        initComponent: function() {

            var self  = this;

            var store = new MetaphorJs.data.Store({

                model: {
                    store: {
                        load: window.dataSource,
                        start: "start",
                        limit: "limit",
                        data: "data",
                        id: "employeeNo",
                        total: "total"
                    }
                },
                clearOnLoad: true,
                pageSize: 100

            });

            self.scope.store = store;
            self.store = store;

            self.scope.$app.onAvailable("tmp").done(function(cmp){
                self.initPagination(cmp);
                store.load();
            });
        },

        initPagination: function(list) {

            window.listRenderer = list;

            MetaphorJs.history.initPushState();

            var self = this,
                store = self.store,
                ps  = store.pageSize,
                Queue = MetaphorJs.lib.Queue,
                queue = new Queue({auto: true, async: false, thenable: true});

            var getPageFromUrl = function(url) {
                var r = /p=([0-9])/,
                    match = r.exec(url);
                return match ? parseInt(match[1], 10) : null;
            };

            var getPageFromBufferState = function(bs) {
                if (!bs) {
                    return 0;
                }
                return parseInt(bs.viewFirst / ps, 10);
            };

            MetaphorJs.history.replaceUrl("?p=0");

            var onBufferChange = function(list, bs, prev) {
                var page = getPageFromBufferState(list.bufferState),
                    curr = getPageFromUrl(location.href);

                if (curr != page) {
                    MetaphorJs.history.pushUrl("?p=" + page);
                }
            };

            var onLocationChange = function(url) {
                var page = getPageFromUrl(url),
                    curr = getPageFromBufferState(list.bufferState);

                return page !== null && page != curr ?
                        list.scrollTo(page * ps) :
                        null;
            };

            list.on("bufferchange", function(list, bs, prev){
                queue.append(onBufferChange, null, [list, bs, prev], Queue.REPLACE, 100);
            });

            MetaphorJs.history.on("locationChange", function(url){
                queue.append(onLocationChange, null, [url], Queue.REPLACE, 100);
            });

        }

    });

    MetaphorJs.cs.define("My.StaticTableCmp", "MetaphorJs.cmp.Component", {
        initComponent: function() {
            this.scope.store = window.dataSource({start: 0, limit: 1000}, true);
        }
    });


}());
