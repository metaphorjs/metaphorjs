const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

const App = MetaphorJs.app.App.$extend({
    initApp: function() {
        this.state.$set({
            hello: "Hello world!"
        });
    }
});

module.exports = App;