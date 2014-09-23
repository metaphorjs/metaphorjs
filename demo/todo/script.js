MetaphorJs.cs.define({

    $class: "My.Todo",
    $extends: "MetaphorJs.Component",

    initComponent: function() {
        this.scope.todos = [
            {text:'learn MetaphorJs', done:true},
            {text:'build a MetaphorJs app', done:false}];
    },
    remaining: function() {
        var todos = this.scope.todos,
            count = 0,
            i, l;
        for (i = 0, l = todos.length; i < l; i++) {
            count += todos[i].done ? 0 : 1;
        }
        return count;
    },
    archive: function() {
        var old = this.scope.todos,
            todos = this.scope.todos = [],
            i, l;
        for (i = 0, l = old.length; i < l; i++) {
            if (!old[i].done) {
                todos.push(old[i]);
            }
        }
    },
    addTodo: function() {
        this.scope.todos.push({text: this.scope.todoText, done: false});
        this.scope.todoText = "";
    }
});