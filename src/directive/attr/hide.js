//#require ../../func/directive.js
//#require ../../func/class/defineClass.js
//#require show.js

registerAttributeHandler("mjs-hide", 500, defineClass(null, "attr.mjs-show", {

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(!val);
        self.initial = false;
    }
}));