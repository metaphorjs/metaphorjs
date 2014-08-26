var parseXML = function(data, type) {

    var xml, tmp;

    if (!data || typeof data !== "string") {
        return null;
    }

    // Support: IE9
    try {
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, type || "text/xml");
    } catch (thrownError) {
        xml = undefined;
    }

    if (!xml || xml.getElementsByTagName("parsererror").length) {
        throw "Invalid XML: " + data;
    }

    return xml;
};