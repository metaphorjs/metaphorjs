$(function(){

    var toggle = function(state, cls) {

        $("li." + cls)[state ? "addClass" : "removeClass"](cls + "-hidden");

        $("li." + cls).each(function(){

            var li      = $(this),
                ul      = li.parent().show(),
                label   = ul.prev("label"),
                vis     = ul.children("li:visible");

            ul[vis.length ? "show" : "hide"]();
            label[vis.length ? "show" : "hide"]();
        });
    };


    $("#toggle-protected").click(function() {
        toggle(this.checked, "protected");
    });
    $("#toggle-private").click(function() {
        toggle(this.checked, "private");
    });
    $("#toggle-inherited").click(function() {
        toggle(this.checked, "inherited");
    });

    $("#hide-sidebar").click(function(){
        $("#sidebar").addClass("hidden").removeClass("visible");
        return false;
    });
    $("#show-sidebar").click(function(){
        $("#sidebar").removeClass("hidden").addClass("visible");
        return false;
    });
});

