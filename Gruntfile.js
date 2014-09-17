

module.exports = function(grunt) {

    grunt.registerTask("build", function(){
        require("../metaphorjs-build/builder/Builder.js")
            .buildAll();
    });

    grunt.registerTask("compile", function(){

        require("../metaphorjs-build/builder/Builder.js")
            .compileAll().done(this.async());
    });

    grunt.registerTask("default", ["build"]);
};