// chrome.browserAction.onClicked.addListener(function(tab){
// 	chrome.tabs.query({active: true, currentWindow: true},function (tabs) {
// 		// Send a message to the active tab
// 		var activeTab = tabs[0];
// 		chrome.tabs.sendMessage(activeTab.id,{"message": "clicked_browser_action"});
// 	});
// });


// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if( request.message === "open_new_tab" ) {
//       chrome.tabs.create({"url": request.url});
//     }
//   }
// );

chrome.runtime.onConnect.addListener(
  function(port) {
    var resp = {};
    console.assert(port.name == "bully");
    port.onMessage.addListener(function(msg){
      if( msg.message === "tweets" ) {
      console.log(msg.tweet);
      var xhr = new XMLHttpRequest();
      var url = "http://172.16.114.169:5000/q";
      var params = msg.tweet;
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      
    xhr.send(params);
    xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
    // JSON.parse does not evaluate the attacker's scripts.s
      resp = JSON.parse(xhr.responseText);
      // console.log(resp);
      port.postMessage({"message": resp});
      }
    }
    }
    });
    
    // return true;
  });