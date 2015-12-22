// this function is used when html is loaded
// usage:
//document.body.innerHTML = langReplaceHtml(document.body.innerHTML, langSubstitute);
function langReplaceHtml(body, langVars) {
    var start = 0;
    for (; ;) {
        start = body.indexOf("||", start) + 2;                  // || is the start delimiter
        if (start == 1) break;                                  // no more start delimiters
        var end = body.indexOf("%%", start);                    // %% is the end delimiter
        if (end == -1) break;                                   // no more end delimiters (probably an error)
        var match = body.substring(start, end);
        if (match) {                                            // no match is also probably an error
            var replacetext = langVars[match];
            start = start -2;
            body = body.substring(0, start) + replacetext + body.substring(end+2);
            start = start + replacetext.length;
        }
    }
    return body;
}

// replace a word or phrase
function langReplace(match) {                                   
    return langSubstitute[match];
}

// replace an array of words or phrases
function langArrayReplace(match) {
    return langSubstitute[match].split(",");
}

// usage: 'Hello {0}!'.format(name)
String.prototype.format = String.prototype.format = function () {
    var s = this,
    i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};



