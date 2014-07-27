
// from jQuery.val()

(function(){

    var rreturn = /\r/g;

    var getValue    = function(elem) {

        var hooks, ret;

        hooks = valHooks[ elem.type ] ||
                valHooks[ elem.nodeName.toLowerCase() ];

        if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
            return ret;
        }

        ret = elem.value;

        return typeof ret === "string" ?
            // Handle most common string cases
               ret.replace(rreturn, "") :
            // Handle cases where value is null/undef or number
               ret == null ? "" : ret;

    };

    var setValue = function(el, val) {


        if ( el.nodeType !== 1 ) {
            return;
        }

        // Treat null/undefined as ""; convert numbers to string
        if ( val == null ) {
            val = "";
        } else if ( typeof val === "number" ) {
            val += "";
        }

        var hooks = valHooks[ el.type ] || valHooks[ el.nodeName.toLowerCase() ];

        // If set returns undefined, fall back to normal setting
        if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
            el.value = val;
        }
    };



    var valHooks = {
            option: {
                get: function( elem ) {
                    //var val = jQuery.find.attr( elem, "value" );
                    var val = elem.getAttribute("value");

                    return val != null ?
                           val :
                           MetaphorJs.trim( elem.innerText || elem.textContent );
                }
            },
            select: {
                get: function( elem ) {
                    var value, option,
                        options = elem.options,
                        index = elem.selectedIndex,
                        one = elem.type === "select-one" || index < 0,
                        values = one ? null : [],
                        max = one ? index + 1 : options.length,
                        disabled,
                        i = index < 0 ?
                            max :
                            one ? index : 0;

                    // Loop through all the selected options
                    for ( ; i < max; i++ ) {
                        option = options[ i ];

                        disabled = option.disabled || option.getAttribute("disabled") !== null ||
                                   options.parentNode.disabled;

                        // IE6-9 doesn't update selected after form reset (#2551)
                        if ( ( option.selected || i === index ) && !disabled ) {

                            // Get the specific value for the option
                            value = getValue(option);

                            // We don't need an array for one selects
                            if ( one ) {
                                return value;
                            }

                            // Multi-Selects return an array
                            values.push( value );
                        }
                    }

                    return values;
                },

                set: function( elem, value ) {
                    var optionSet, option,
                        options = elem.options,
                        values = MetaphorJs.toArray( value ),
                        i = options.length;

                    while ( i-- ) {
                        option = options[ i ];
                        if ( (option.selected = MetaphorJs.inArray( option.value, values )) ) {
                            optionSet = true;
                        }
                    }

                    // Force browsers to behave consistently when non-matching value is set
                    if ( !optionSet ) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        };

    valHooks["radio"] = valHooks["checkbox"] = {
        set: function( elem, value ) {
            if (MetaphorJs.isArray( value ) ) {
                return ( elem.checked = MetaphorJs.inArray( getValue(elem), value ) >= 0 );
            }
        },
        get: function( elem ) {
            return elem.getAttribute("value") === null ? "on" : elem.value;
        }
    };


    MetaphorJs.getValue     = getValue;
    MetaphorJs.setValue     = setValue;


}());