//#require ../func/nsAdd.js
//#require ../vars/numberFormats.js

nsAdd("filter.numeral",  function(val, scope, format) {
    format  = numberFormats[format] || format;
    return numeral(val).format(format);
});