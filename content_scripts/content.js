// Old form style
function getWorkitemInfo2012() {
    function cleanUpCaption(str) {
        return str.replace(":", "").replace("Change request", "CR").trim();
    }

    function cleanUpDescription(str) {
        return str.replace("&lt;", "<").replace("&gt;", ">").trim();
    }

    var header = document.querySelector(".workitem-info-bar .info-text-wrapper");
    if (!header) {
        console.log("TFS 2012: Workitem header is not found");
        return;
    }

    var idElement = header.querySelector("a.caption");
    if (!idElement) {
        console.log("TFS 2012: Link with workitem id not found");
        return;
    }

    var titleElement = header.querySelector("span.info-text");
    if (!titleElement) {
        console.log("TFS 2012: Span with workitem title not found");
        return;
    }

    var info = {
        id: cleanUpCaption(idElement.innerHTML),
        title: cleanUpDescription(titleElement.innerHTML)
    };

    console.log("TFS 2012: Workitem info extracted:", JSON.stringify(info));
    return info;
}

// New form style
function getWorkitemInfo2017() {
    var header = document.querySelector(".work-item-form-headerContent");
    if (!header) {
        console.log("TFS 2017: Workitem header is not found")
        return;
    }

    var idSpan = header.querySelector("div.work-item-form-headerContent div.work-item-form-id span");
    var titleInput = header.querySelector("div.work-item-form-title div.wrap input");
    if (!idSpan || !titleInput) {
        console.log("TFS 2017: Span with workitem id or input with workitem title not found");
        return;
    }

    function getAsTrimmedString(s) {
        if (typeof s === "string")
            return s.trim();
        return "";
    }

    var info = {
        id: getAsTrimmedString(idSpan.innerHTML),
        title: getAsTrimmedString(titleInput.value)
    };

    if (info.id.length == 0 || info.title.length == 0) {
        console.log("TFS 2017: Id or title value is empty");
        return;
    }

    console.log("TFS 2017: Workitem info extracted:", JSON.stringify(info));
    return info;
}

function getWorkitemInfo() {
    var info = getWorkitemInfo2017();
    if (info)
        return info;
    info = getWorkitemInfo2012();
    return info;
}

function contentScriptMain() {
	var port = chrome.runtime.connect();
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		console.log("Request received ", JSON.stringify(request));
        if (request.action == "getWorkitemInfo") {
            var info = getWorkitemInfo();
            if (!info) {
                console.log("Failed to extract workitem info");
                return;
            }
            sendResponse(info);
            return;
        }
	});

    setTimeout(function() {
        console.log("Try to extract current workitem info...");

        var info = getWorkitemInfo();
        if (!info || !info.title) {
            return;
        }

        info.id = info.id.replace(/\D/g, "");
        if (!info.id) {
            console.log("No workitem info extracted");
            return;
        }
        info.lastAccess = Date.now();

        console.log("Updating recent items...");
        updateRecentWorkitems(info, function() {
            console.log("Recent items updated");
        });
    }, 10*1000);
}

console.log("AzDoQa started");
contentScriptMain();
