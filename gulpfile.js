
var gulp = require("gulp");

gulp.task("default", function(){
    require("../metaphorjs-build/builder/Builder.js")
        .buildAll();
});

gulp.task("build", function(){
    require("../metaphorjs-build/builder/Builder.js")
        .buildAll();
});

gulp.task("compile", function(done){
    require("../metaphorjs-build/builder/Builder.js")
        .compileAll().done(done);
});