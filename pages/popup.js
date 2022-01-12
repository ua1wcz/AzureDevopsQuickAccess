// @ts-nocheck
var azDoCollection = "";
var azDoUrl = "";

function extractNumbers(str) {
	var ids = str.split(/[\s,;]+/).map(s => parseInt(s)).filter(n => !isNaN(n));
	return ids;
}

function tryGetValueFromClipboard() {
	var pasteBuffer = document.getElementById("paste_buffer");
	pasteBuffer.hidden = false;
	pasteBuffer.focus();

	if (document.execCommand("paste")) {
		console.log("accuired value =", pasteBuffer.value)
		var ids = extractNumbers(pasteBuffer.value);
		console.log("extracted ids:", JSON.stringify(ids));
		if (ids.length > 0) {
			document.getElementById("workitem_id_input").value = ids.join(", ");
		}
	} else {
		console.log("failed to acquire value")
	}
	pasteBuffer.hidden = true;
}

function initInputField() {
	var input = document.getElementById("workitem_id_input");

	function numbersToLimitedString(numbers) {
		if (numbers.length <= 3)
			return numbers.join(", ");
		s = numbers.slice(0, 2).join(", ") + ", ..., " + numbers.slice(-1).join(", ");
		s += " (" + numbers.length.toString() + " items)";
		return s;
	}

	function onInputChange() {
		var section = document.getElementById("workitem_link_section");
		var link = document.getElementById("workitem_link");
		link.onclick = function(event) {
			var ids = extractNumbers(input.value);
			console.log("extracted ids:", JSON.stringify(ids));
			if (ids.length == 1) {
				// one item is opened in new active tab
				openWorkitem(azDoUrl, azDoCollection, ids[0], true, function() { console.log("finished"); } );
			} else {
				// several items are opened in new inactive tabs
				openWorkitems(azDoUrl, azDoCollection, ids, function() { console.log("finished"); } );
			}
			event.preventDefault();
		};
		if (input.value == "") {
			section.hidden = true;
			return;
		}
		link.innerHTML = "Go to " + numbersToLimitedString(extractNumbers(input.value));
		section.hidden = false;
	}

	input.oninput = onInputChange;
	input.onfocus = onInputChange;
	input.onkeydown = function(e) {
		if (e.keyCode == 13) {
			var ids = extractNumbers(input.value);
			console.log("extracted ids:", JSON.stringify(ids));
			if (ids.length == 1) {
				// one item is opened in new active tab
				openWorkitem(azDoUrl, azDoCollection, ids[0], true, function() { console.log("finished"); } );
			} else {
				// several items are opened in new inactive tabs
				openWorkitems(azDoUrl, azDoCollection, ids, function() { console.log("finished"); } );
			}
		}
	};

	tryGetValueFromClipboard();
	input.focus();
	input.select();
}

function initRecentItemsList() {
	var area = document.getElementById("recent_items_section");
	clearElement(area);

	storageGetUserData(function(data) {
		if (!data.recent_items || (data.recent_items.length == 0)) {
			return;
		}

		if (data.recent_items.length > MaxRecentItemsToShowInPopup) {
			var eraseCount = data.recent_items.length - MaxRecentItemsToShowInPopup;
        	data.recent_items.splice(-eraseCount, eraseCount);
		}

		area.appendChild(createSpan("Recent items:"));
		area.appendChild(createBr());
		var table = createElement("table");

		for (item of data.recent_items) {
			var tr = createElement("tr");
			const id = item.id;
			var openItemLink = createLink(id.toString(), function() { openWorkitem(azDoUrl, azDoCollection, id, false); });
			var itemTitleSpan = createSpan(shortenWorkitemName(item.title));
			var itemLastAccessSpan = createSpan(timeIntervalToVerbal(Date.now() - item.lastAccess) + " ago" );
			if (item.title) {
				openItemLink.title = item.title;
				itemTitleSpan.title = item.title;
			}
			itemLastAccessSpan.title = (new Date(item.lastAccess)).toLocaleString();
			var td1 = createElement("td"); td1.appendChild(openItemLink);
			var td2 = createElement("td"); td2.appendChild(itemTitleSpan);
			var td3 = createElement("td"); td3.appendChild(itemLastAccessSpan);
			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			table.appendChild(tr);
		}

		var moreRecentItemsLink = createLink("More items", function(e) {
			openPage(chrome.runtime.getURL("pages/recent_items.html"), true);
		});

		var confirmDeleteLink = createLink("<strong>Really delete all recent items?</strong>", function() {
			storageModifyUserData(function(data) {
				data.recent_items = new Array();
			});
			clearElement(area);
			area.appendChild(createSpan("Items were deleted"));
		});

		var clearRecentItemsLink = createLink("Clear recent items", function(e) {
			e.target.hidden = true;
			e.target.parentElement.appendChild(confirmDeleteLink);
		});

		var lastRow = createElement("tr");
		var lastCell1 = createElement("td"); lastCell1.appendChild(moreRecentItemsLink);
		var lastCell2 = createElement("td"); lastCell2.appendChild(clearRecentItemsLink);
		var lastCell3 = createElement("td");
		lastRow.appendChild(lastCell1); lastRow.appendChild(lastCell2); lastRow.appendChild(lastCell3);
		table.appendChild(lastRow);

		area.appendChild(table);
	});
}

function isAzDoUrl(str, info) {
	var regexp = new RegExp("^(https://malwarebytes.visualstudio.com/)([A-Za-z_/]+)/_workitems.*$");
	var res = regexp.exec(str);
	if (!res)
		return false;
	if (res[0] != str)
		return false;
	if (res[1].length == 0)
		return false;
	info.url = res[1];
	info.collectionName = res[2];
	return true;
}

function isAzDoUrlWorkitem(str) {
	var regexp = new RegExp("^https://malwarebytes.visualstudio.com/.*/_workitems/.*/([0-9]+).*$");
	var res = regexp.exec(str);
	if (!res)
		return false;
	return true;
}

function initSettings() {
	chrome.tabs.getSelected(null, function() {
		storageGetUserSettings(function(settings) {
			if (settings.defaults_initialized) {
				azDoCollection = settings.base_azdo_collection;
				azDoUrl = settings.base_azdo_url;
			}
			else {
				storageModifyUserSettings(
					function(settings) { 
						settings.base_azdo_url = "https://example.visualstudio.com/";
						settings.base_azdo_collection = "TEST";
						settings.defaults_initialized = true; 
					},
					function() {
						main();
					});
			}
		});
	});
}

function initCurrentWorkitemInfo() {
	chrome.tabs.getSelected(null, function(tab) {
		if (!isAzDoUrlWorkitem(tab.url)) {
			console.log("initCurrentWorkitemInfo: not a AzDo workitem URL (" + tab.url + ")");
			return;
		}

		function tryExtractWorkitemInfo(onFound) {
			chrome.tabs.sendMessage(tab.id, {action: "getWorkitemInfo"}, function(response) {
				if (!response) {
					console.log("initCurrentWorkitemInfo: no response received from content script");
					return;
				}

				console.log("initCurrentWorkitemInfo: response from content script: ", JSON.stringify(response));

				var section = document.getElementById("current_workitem_section");
				section.hidden = false;

				var fullTitle = response.id + ": " + response.title;

				var copyToClipboard = function(text) {
					var pasteBuffer = document.getElementById("paste_buffer");

					pasteBuffer.hidden = false;
					pasteBuffer.value = text;
					pasteBuffer.focus();
					pasteBuffer.select();

					if (document.execCommand("copy")) {
						console.log("copied");
						var resultSpan = document.getElementById("copy_content_result_span");
						resultSpan.innerHTML = "<br/>" + "'<i>" + text + "</i>' copied to clipboard";
					} else {
						console.log("failed to copy value")
					}

					pasteBuffer.value = "";
					pasteBuffer.hidden = true;
				}

				var copyTitleLink = document.getElementById("copy_current_workitem_title_link");
				copyTitleLink.addEventListener("click", function() {
					copyToClipboard(fullTitle);
				});
				copyTitleLink.title = "Copy '" + fullTitle + "' to clipboard";

				onFound();
			});
		}

		const checkForInfo = function() {
			tryExtractWorkitemInfo(function() {
				console.log("initCurrentWorkitemInfo: item info found");
				clearInterval(timer);
			})
		};
		var timer = setInterval(checkForInfo, 1000);
		checkForInfo();
	});
}

function main() {
	initInputField();
	initRecentItemsList();
	initSettings();
	initCurrentWorkitemInfo();
}

document.addEventListener("DOMContentLoaded", function() {
	main();
});
