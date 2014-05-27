var totalDownloads = 0;
var radioSiteLink = "http://radio24.ua";
var songsData = { // current songs list
    list: [],
    html: ''
};
var downloadInProgress = false;
var downloadQueryList = [];
var downloadIndex = 0;

/*** Custom functions ***/

// download files to radio24 folder and overwrite if exist
chrome.downloads.onDeterminingFilename.addListener ( function ( item, suggest ) {
    suggest ( {filename : 'radio24/' + item.filename, conflict_action : 'overwrite', conflictAction : 'overwrite'} );
} );

// update budge counter
function updateBadgeCounter ( counter ) {
    chrome.browserAction.setBadgeBackgroundColor ( {color : [223, 58, 58, 255]} );
    chrome.browserAction.setBadgeText ( {text : counter.toString ()} );
}

// delete budge counter
function deleteBadgeCounter () {
    chrome.browserAction.setBadgeBackgroundColor ( {color : [0, 0, 0, 0]} );
    chrome.browserAction.setBadgeText ( {text : ''} );
}

// open link in new chrome tab
function openLinkInCurrentTab(url) {
    chrome.tabs.update ( null, {url : url} );
}
