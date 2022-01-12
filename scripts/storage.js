const NodeNameSettings = "user_settings";
const NodeNameData = "user_data";

function storageGetAll(onComplete)
{
    chrome.storage.local.get(null, function(result) {
        if (onComplete) {
            onComplete(result);
        }
    });
}

function storageGetNode(nodeName, onComplete)
{
    chrome.storage.local.get(nodeName, function(result) {
        if (!result[nodeName]) {
            result[nodeName] = {};
        }
        if (onComplete) {
            onComplete(result[nodeName]);
        }
    });
}

function storageSetNode(nodeName, nodeValue, onComplete)
{
    var assignedFields = {};
    assignedFields[nodeName] = nodeValue;
    chrome.storage.local.set(assignedFields, function() {
        if (onComplete) {
            onComplete();
        }
    });
}

function storageGetUserSettings(onComplete)
{
    storageGetNode(NodeNameSettings, onComplete);
}

function storageSetUserSettings(nodeValue, onComplete)
{
    storageSetNode(NodeNameSettings, nodeValue, onComplete);
}

function storageGetUserData(onComplete)
{
    storageGetNode(NodeNameData, onComplete);
}

function storageSetUserData(nodeValue, onComplete)
{
    storageSetNode(NodeNameData, nodeValue, onComplete);
}

function storageModifyUserData(modify, onComplete) {
	storageGetUserData(function(data) {
		modify(data);
		storageSetUserData(data, onComplete);
	});
}

function storageModifyUserSettings(modify, onComplete) {
	storageGetUserSettings(function(data) {
		modify(data);
		storageSetUserSettings(data, onComplete);
	});
}
