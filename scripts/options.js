window.onload = function() {
    var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
    var shortcut_text = document.querySelector("#shortcut_text");
    if (isMac)
        shortcut_text.innerText = "Cmd+Shift+S";

    var shortcut_box = document.querySelector("#shortcut_box");
    chrome.storage.local.get("shortcut_enabled", function(obj) {
        shortcut_box.checked = obj.shortcut_enabled;
        shortcut_box.onchange = function() {
            chrome.storage.local.set({"shortcut_enabled":shortcut_box.checked});
        }
    })

    var azure_url = document.querySelector("#azdo_url");
    storageGetUserSettings(function(settings) {
        azure_url.value = settings.base_azdo_url;
            azure_url.onchange = function() {
                storageModifyUserSettings(
                    function(settings) { settings.base_azdo_url = azure_url.value; },
                    function() {});
            }, function() {}
    });

    var azure_project_name = document.querySelector("#azdo_project_name");
    storageGetUserSettings(function(settings) {
        azure_project_name.value = settings.base_azdo_collection;
        azure_project_name.onchange = function() {
                storageModifyUserSettings(
                    function(settings) { settings.base_azdo_collection = azure_project_name.value; },
                    function() {});
            }, function() {}
    })

    var current_year = document.getElementById('current_year');
    current_year.innerHTML = (new Date()).getFullYear();
}

