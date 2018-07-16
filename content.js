// alert("Hello from your Chrome extension!")

// content.js

// chrome.runtime.onMessage.addListener(
// 	function(request, sender, sendResponse){
// 		if(request.message == "clicked_browser_action"){
// 			var firstHref = $("a[href^='http']").eq(0).attr("href");
// 			console.log(firstHref);
// 			chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
// 		}
// 	}
// );

// var Name = document.getElementsByClassName("u-textInheritColor")[0].innerText;
// console.log(Name);

// chrome.runtime.sendMessage({"message": "profile_name", "ans": Name}, function(response) {
//   console.log(response.message);
// });


var TWITTER_TWEET_TEXT_CLASS = "tweet-text"; //css class name of tweet text
var TWITTER_TWEET_CONTAINER_CLASS = "tweet"; //css class name of tweet text container

// given a sentiment score (from -.5 to .5), return an html color representing that sentiment
var sentimentColor = function(sentiment) {
    var color = '';
    if (sentiment < -0.5) { // dark red
        color = '#d07e7e';
    }
    else if (sentiment < -0.3) { // medium red
        color = '#eec1c1';
    }
    else if (sentiment < -0.1) { // light red
        color = '#e7c3c3';
    }
    else if (sentiment < 0.01) { // grey
        color = '#F8F8F8';
    }
    else if (sentiment < 0.1) { // light green
        color = '#cfe7be';
    }
    else if (sentiment < 0.3) { // medium green
        color = '#DEEED4';
    }
    else { // dark green
        color = '#ACD093';
    }
    return color;
};

// given a sentiment response from the Rosette API and a text container, 
// set the outer container's background color according to its
// calculated sentiment
function getSentimentAndColor(resp, container) {
    var pos = 0;
    var neg = 0;
    // necessary becuase response returns positive and negative confidence
    // in a different order depending on dominant sentiment (positive or negative)
    if (resp.document.label == "pos") {
        pos = resp.document.confidence;
    } else if (resp.document.label == "neg") {
        neg = resp.document.confidence;
    }

    var posVal = parseFloat(pos);
    var negVal = parseFloat(neg);

    container.style.backgroundColor = sentimentColor(posVal-negVal);
}


// returns true of element has class cls
var hasClass = function(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
};

// given a tweet element, return the container element
var getTweetContainer = function(tweet) {
    var container = tweet;
    while(!hasClass(container, TWITTER_TWEET_CONTAINER_CLASS) && container.parentNode) {
        container = container.parentNode;
    }
    return container;
};

//get the response

var getSentiment = function(text,container) {
    var response = {};
    var port = chrome.runtime.connect({name:"bully"});
    port.postMessage({"message": "tweets", "tweet": text});
    
    port.onMessage.addListener(function(msg){
        response = msg.message;
        console.log(response);
        console.log(container);
        // container.style.backgroundColor='red';
    });

        
}


var fillSentiment = function() {
    var tweets = document.getElementsByClassName(TWITTER_TWEET_TEXT_CLASS);
    
    // first make sure there are new entries to analyze
    var newEntries = false;
    for (var i in tweets) {
        var tweet = tweets[i];
        if(!tweet.getAttribute || tweet.getAttribute("done")) {
            continue;
        }
        newEntries = true;
        break;
    }
    if (!newEntries)
        return;
    
    for (var i in tweets) {
        var tweet = tweets[i];
        if(!tweet.getAttribute || tweet.getAttribute("done")) {
            continue;
        }
        tweet.setAttribute("done", "1");
        var response = {};
        var tweet = tweets[i];
        var text = tweet.innerText;
        var container = getTweetContainer(tweet);
        if(!tweet.getAttribute) {
            continue;
        }
        getSentiment(text,container);

    }
};

//listen for when DOM is changed by AJAX calls
var react = function(evt) {
    // don't run right away. Rather wait a second so requests get batch sent
    setTimeout(function() {
        fillSentiment();
    }, 100);
}
document.addEventListener("DOMNodeInserted", react);