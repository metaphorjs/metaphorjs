require.config({
    baseUrl: "/",
    paths: {
        "metaphorjs": "metaphorjs/dist/metaphorjs.amd",
        "metaphorjs-ajax": "metaphorjs-ajax/dist/metaphorjs.ajax.amd",
        "metaphorjs-animate": "metaphorjs-animate/dist/metaphorjs.animate.amd",
        "metaphorjs-class": "metaphorjs-class/dist/metaphorjs.class.amd",
        "metaphorjs-dialog": "metaphorjs-dialog/dist/metaphorjs.dialog.amd",
        "metaphorjs-history": "metaphorjs-history/dist/metaphorjs.history.amd",
        "metaphorjs-input": "metaphorjs-input/dist/metaphorjs.input.amd",
        "metaphorjs-model": "metaphorjs-model/dist/metaphorjs.model.amd",
        "metaphorjs-namespace": "metaphorjs-namespace/dist/metaphorjs.namespace.amd",
        "metaphorjs-observable": "metaphorjs-observable/dist/metaphorjs.observable.amd",
        "metaphorjs-promise": "metaphorjs-promise/dist/metaphorjs.promise.amd",
        "metaphorjs-select": "metaphorjs-select/dist/metaphorjs.select.amd",
        "metaphorjs-validator": "metaphorjs-validator/dist/metaphorjs.validator.amd",
        "metaphorjs-watchable": "metaphorjs-watchable/dist/metaphorjs.watchable.amd"
    }
});

require(["metaphorjs"], function(MetaphorJs) {

    console.log(MetaphorJs);

    MetaphorJs.run();
});