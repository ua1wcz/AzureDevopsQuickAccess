var azDoCollection = "";
var azDoUrl = "";

function initRecentItemsList() {
	var area = document.getElementById("recent_items_section");
	clearElement(area);

	storageGetUserData(function(data) {
		if (!data.recent_items || (data.recent_items.length == 0)) {
			area.appendChild(createSpan("Recent items list is empty"));
			return;
		}
		area.appendChild(createSpan("Recent items:"));
		area.appendChild(createBr());
		var table = createElement("table");

		for (item of data.recent_items) {
			var tr = createElement("tr");
			const id = item.id;
			var td1 = createElement("td"); td1.appendChild(createLink(id.toString(), function() { openWorkitem(id, false); }));
			var td2 = createElement("td"); td2.appendChild(createSpan(item.title));
			var td3 = createElement("td"); td3.appendChild(createSpan(timeIntervalToVerbal(Date.now() - item.lastAccess) + " ago" ));
			var td4 = createElement("td"); td4.appendChild(createLink("Delete", function() { eraseRecentWorkitem(id, initRecentItemsList); }));
			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			tr.appendChild(td4);
			table.appendChild(tr);
		}
		area.appendChild(table);

		var confirmDeleteLink = createLink("<strong>Really delete all recent items?</strong>", function(e) {
			storageModifyUserData(function(data) {
				data.recent_items = new Array();
			});
			clearElement(area);
			area.appendChild(createSpan("Items were deleted"));
		});

		area.appendChild(createLink("Clear recent items", function(e) {
			e.target.hidden = true;
			e.target.parentElement.appendChild(confirmDeleteLink);
		}));
	});
}

function initCollectionData() {
	storageGetUserSettings(function(settings) {
		if (!settings.base_azdo_collection || (settings.base_azdo_collection.length == 0))
			return;

		azDoCollection = settings.base_azdo_collection;

		if (!settings.base_azdo_url || (settings.base_azdo_url.length == 0))
			return;
		
		azDoUrl = settings.base_azdo_url;
	});
}

function main() {
	initRecentItemsList();
	initCollectionData();
}

document.addEventListener("DOMContentLoaded", function() {
	main();
});
