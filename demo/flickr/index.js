

MetaphorJs.cs.define({

    $class: "My.Flickr",
    $extends: "MetaphorJs.Component",

    store: null,

    initComponent: function() {

        var self = this,
            scope = self.scope,
            store;

        store = new MetaphorJs.Store({

            model: {
                store: {
                    data: "items",
                    id: "link",
                    load: {
                        crossDomain: true,
                        jsonp: true,
                        jsonpParam: "jsoncallback",
                        url: "//api.flickr.com/services/feeds/photos_public.gne",
                        extra: {
                            format: "json"
                        }
                    }
                }
            }
        });

        self.$super();
        store.load();

        scope.store = store;

        setInterval(MetaphorJs.bind(store.load, store), 5000);
    }

});