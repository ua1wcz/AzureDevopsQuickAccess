function logAsJson(description, data) {
	console.log(description + " (raw) :", data);
	console.log(description + " (json):", JSON.stringify(data));
}

function main() {
	var control = document.getElementById("control");
	var log = document.getElementById("log");

	control.appendChild(createLink("Log settings", function() {
		storageGetUserSettings(function(result) {
			logAsJson("user_settings", result);
		});
	}) );
	control.appendChild(createBr());

	control.appendChild(createLink("Log data", function() {
		storageGetUserData(function(result) {
			logAsJson("user_data", result);
		});
	}));
	control.appendChild(createBr());

	control.appendChild(createLink("Log all", function() {
		storageGetAll(function(result) {
			document.getElementById("storage_data").innerHTML = "storageData: " + JSON.stringify(result);
			logAsJson("all_data", result);
		});
	}));
	control.appendChild(createBr());

	control.appendChild(createBr());

	control.appendChild(createLink("Clean all storage data", function() {
		chrome.storage.local.clear(function() {
			console.log("data cleared");
			storageGetAll(function(result) {
				document.getElementById("storage_data").innerHTML = "storageData: " + JSON.stringify(result);
			});
		});
	}));
	control.appendChild(createBr());

	storageGetAll(function(result) {
		document.getElementById("storage_data").innerHTML = "storageData: " + JSON.stringify(result);
		logAsJson("all_data", result);
	});
}

document.addEventListener("DOMContentLoaded", function () {
	main();
});
