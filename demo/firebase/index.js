

MetaphorJs.cs.define({

    $class: "My.Firebase",
    $extends: "MetaphorJs.Component",

    // see mjs-cmp-prop attribute
    chat: null,

    initComponent: function() {

        this.$super();

        // FirebaseStore is not included in the default
        // distribution; you need to build MetaphorJs with it
        var store = new MetaphorJs.FirebaseStore(
            new Firebase("https://metaphorjs-posts.firebaseio.com").limit(10)
        );
        store.load();

        this.scope.store = store;

        store.on("update", this.scrollDown, this);
    },

    // mjs-validator-submit: call this function
    // on submit if the form is valid
    submit: function() {

        var scope = this.scope,
            fb = scope.store.ref();

        fb.push({
            nickname: scope.nickname,
            date: (new Date).getTime(),
            post: scope.post
        });

        scope.post = "";
        scope.$check();
        scope.submitForm.$reset();

        // prevent form submit
        return false;
    },

    scrollDown: function() {
        var self = this;
        MetaphorJs.async(function(){
            self.chat.scrollTop = self.chat.scrollHeight;
        });
    }

});
