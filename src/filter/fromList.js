//#require ../func/nsAdd.js
//#require ../func/array/toArray.js
//#require ../func/array/isArray.js

nsAdd("filter.fromList", function(input, scope, separator) {

    separator = separator || ", ";

    if (input && input.length) {
        if (!isArray(input)){
            input = toArray(input);
        }
        return input.join(separator);
    }

    return "";
});