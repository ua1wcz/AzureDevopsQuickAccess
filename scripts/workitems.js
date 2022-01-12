const MaxRecentItemsToStore = 1024;
const MaxRecentItemsToShowInPopup = 27;

var azDoCollection = "";
var azDoUrl = "";

function openPage(url, isActive) {
	if (url == "")
		return;
	chrome.tabs.create({url: url, active: isActive});
}

function getWorkitemUrl(azDoUrl, azDoCollection, workitemId) {
	return azDoUrl + '/' + azDoCollection + "/_workitems?_a=edit&id=" + workitemId;
}

function updateRecentWorkitemInfo(data, itemInfo) {
    if (!data.recent_items) {
        data.recent_items = new Array();
    }

    var pos = data.recent_items.find(function(it) { return it.id == itemInfo.id; });
    if (pos === undefined) {
        data.recent_items.push(itemInfo);
    } else {
        pos.info = itemInfo.info;
        if (itemInfo.title && itemInfo.title.length > 0) {
            pos.title = itemInfo.title;
        }
        pos.lastAccess = itemInfo.lastAccess;
    }

    data.recent_items.sort(function(v1, v2) { return v2.lastAccess - v1.lastAccess; });

    if (data.recent_items.length > MaxRecentItemsToStore) {
        var eraseCount = data.recent_items.length - MaxRecentItemsToStore;
        data.recent_items.splice(-eraseCount, eraseCount);
    }
}

function shortenWorkitemName(name) {
    if (!name)
        return name;
    const LeftPart = 85;
    const RightPart = 20;
    if (name.length <= LeftPart + RightPart + 5)
        return name;
    return name.substr(0, LeftPart ) + " ... " + name.substr(name.length - RightPart, name.length);
}

function updateRecentWorkitems(itemInfo, onComplete) {
	storageModifyUserData(function(data) { updateRecentWorkitemInfo(data, itemInfo); }, onComplete);
}

function openWorkitem(azDoUrl, azDoCollection, workitemId, isNewTabActive, onComplete) {
	updateRecentWorkitems({id: workitemId, info: "", lastAccess: Date.now()}, function() {
		openPage(getWorkitemUrl(azDoUrl, azDoCollection, workitemId), isNewTabActive);
        if (onComplete) {
            onComplete();
        }
	});
}

function openWorkitems(azDoUrl, azDoCollection, workitemIds, onComplete) {
    function processNext(currentIndex) {
        if (currentIndex >= workitemIds.length) {
            if (onComplete) {
                onComplete();
            }
            return;
        }
        openWorkitem(azDoUrl, azDoCollection, workitemIds[currentIndex], false, function() { processNext(currentIndex + 1); });
    }
    processNext(0);
}

function eraseRecentWorkitem(itemId, onComplete) {
	storageModifyUserData(function(data) {
		data.recent_items = data.recent_items.filter(function(item) {
			return item.id != itemId;
		});
	}, onComplete);
}
