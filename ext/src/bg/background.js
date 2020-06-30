MY_SERVER = "https://multlink.ml/"

// For command triggering the action
chrome.commands.onCommand.addListener(function (command) {
	if (command === "copy-window-tabs") {
		onTriggerAction()
	}
});

// Fpr icon click triggering the action
chrome.browserAction.onClicked.addListener(function (tab) {
	onTriggerAction()
});

chrome.browserAction.setTitle({
	title: 'Alt + C'
});

chrome.webRequest.onBeforeRequest.addListener(
	function (details) {
		console.log(details)
		let url = details.url
		let notSaveReq = url.indexOf("/save/")==-1
		if(notSaveReq)		openLinksFromSyncStorage(url.substring(url.lastIndexOf('/')+1))
		return {cancel: notSaveReq };
	}, {
		urls: ["*://multlink.ml/*"]
	},
	["blocking"]
);
// This function copies all tab urls in the current window
// And squishes them into a small url. 
// And copy it to the clipboard.
// This function also stores the urls in cloud for sharability over the internet feature.
function onTriggerAction() {

	let my_links = []
	let my_link = ""

	chrome.tabs.query({
		lastFocusedWindow: true
	}, tabs => { // get all tabs

		for (i in tabs) {
			my_links.push(tabs[i].url) // get all urls
		}

		my_link = my_links.join(" "); // make it string
		my_link = window.btoa(my_link) //base64 encoding (for ease of handling)

		$.ajax({ // sending to the server to persist the map between squished url and the real urls
			url: MY_SERVER + 'save/' + my_link,
			success: function (result) {}
		});

		my_link = CryptoJS.MD5(my_link).toString(); // md5 hasing to squish the urls

		saveInSyncStorage(my_link, my_links)

		my_link = MY_SERVER + my_link // make internet accessible short url.

		copyTextToClipboard(my_link) // copy the squished url to clipboard. so the user can paste it readily

		chrome.browserAction.setIcon({ // set success icon
			path: "../../icons/tick.png"
		});

		setTimeout(function () { // back to normal icon
			chrome.browserAction.setIcon({
				path: "../../icons/128.png"
			});
		}, 1000)
	})
}

function openLinksFromSyncStorage(key){
	// chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	// 	console.log(tabs[0].url);
	// 	window.close()
	// });
	chrome.storage.sync.get(key, function(result) {

		result[key].forEach(function(url){
			window.open(url)
		})
	  });
	  window.url
}

function saveInSyncStorage(my_link, my_links){
	let obj ={}
	obj[my_link] = my_links
	chrome.storage.sync.set(obj, function() {
		console.log('Value is set to ' + my_links);
	  });
}

// This function copies given text to clipboard.
function copyTextToClipboard(text) {

	var copyFrom = document.createElement("textarea"); //Create a textbox field where we can insert text to. 

	copyFrom.textContent = text; //Set the text content to be the text you wished to copy.

	document.body.appendChild(copyFrom); //Append the textbox field into the body as a child. 	//"execCommand()" only works when there exists selected text, and the text is inside 	//document.body (meaning the text is part of a valid rendered HTML element).

	copyFrom.select(); //Select all the text!

	document.execCommand('copy'); //Execute command

	copyFrom.blur(); //(Optional) De-select the text using blur(). 

	document.body.removeChild(copyFrom); //Remove the textbox field from the document.body, so no other JavaScript nor 	//other elements can get access to this.

}