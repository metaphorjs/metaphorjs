//#require ../func/nsAdd.js
//#require ../vars/dateFormats.js

nsAdd("filter.moment",  function(val, scope, format) {
    format  = numberFormats[format] || format;
    return moment(val).format(format);
});