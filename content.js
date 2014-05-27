// init vars
var bodyItem = $('body');
var resultItem = $('#result');
    resultItem.css('display', 'none');
var totalDownloadsItem = $('#total-downloads');
var totalDownloadContainer = $('#total-downloads-container');
var downloadAllSongsContainer = $('#download-all-songs');

var downloadIndex = 0;
var downloadTotal = 0;
var totalSongsCounter = 0;
var totalDownloads = 0;
var songsUrl = [];
var downloadQueryList = [];
var downloadInProgress = false;

// download files to radio24 folder and overwrite if exist
chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) { 
	suggest({filename: 'radio24/' + item.filename, conflict_action: 'overwrite', conflictAction: 'overwrite'});
}); 

// check donwload proccess
chrome.downloads.onChanged.addListener(function(downloadDelta){
    if(downloadDelta.state) {
    	if(downloadDelta.state.current == "complete") {
	    totalDownloads--;
	    totalDownloadsItem.text(totalDownloads);
            if(totalDownloads > 0 && downloadInProgress) {
	        downloadIndex++;
                startDownloadProccess(downloadIndex);
            } else {
	    	downloadInProgress = false;
		downloadQueryList = [];
		downloadAllSongsContainer.css('display', 'block');
    		totalDownloadContainer.css('display', 'none');
	    }
        }
    }
});

// add to chrome download query
function chromeDownloadQueryAdd(index) {
    if(songsUrl.length && songsUrl[index]) {
	downloadQueryList.push(songsUrl[index]);
    }
    
    if(!downloadInProgress) {
    	startDownloadProccess(0);
	downloadInProgress = true;
    }
}

// start browser download proccess
function startDownloadProccess(index) {
    var downloadParams = {url: downloadQueryList[index], conflictAction: "overwrite"};
	downloadAllSongsContainer.css('display', 'none');
    	totalDownloadContainer.css('display', 'block');
	chrome.downloads.download(downloadParams, function(downloadId){  });
}

// refresh playlist data
$.get('http://radio24.ua', function(data) {
    var songs = $('.tab-content-item', data);
    var songsData = '';
    var songName = '';
    var songUrl = '';
    var breakLine = '';
    	songsUrl = [];
    
    downloadAllSongsContainer.css('display', 'block');
    totalDownloadContainer.css('display', 'none');

    songs.each(function(index) {
    	var songData = $(this).find('.left:eq(0)');
    	var songTitle = $(this).find('.left:eq(1)');
	
	if(songData.length) {
        	var songItemPath = $(this).find("input").first().val();
        	    songUrl = 'http://radio24.ua/' + songItemPath;
    	}

	if(songTitle.length) {
        	var songPerformer = $(this).find(".performer").text();
	    	    songName = $(this).find(".song").text();
            	if(songPerformer) {
		    songName = songPerformer + ' - ' + songName;
	    	}
	}
	
	if(songUrl && songName) {
		var imgDownloadTrack = '<img song-index="' + index + '" song-name="' + songName + '" song-url="' + songUrl + '" class="img-download-track" src="images/img.png" title="Download track">';
		songsData += breakLine + imgDownloadTrack + ' ' + (parseInt(index) + 1) + '. ' + '<a href="' + songUrl + '" target="_blank">' + songName + '</a>';
		breakLine = '<br>';
		songsUrl.push(songUrl);
	}
    });
    totalSongsCounter = songsUrl.length;
    
    resultItem.html(songsData);
    resultItem.slideDown(500);

     $('.img-download-track').on('click', function(event) {
	event.preventDefault();
	var songDownloadIndex = $(this).attr('song-index');
	totalDownloads += 1;
	totalDownloadsItem.text(totalDownloads);
	chromeDownloadQueryAdd(songDownloadIndex);
    });

    $('#download-all-songs').on('click', function(event) {
	event.preventDefault();
	if(songsUrl.length) {
            totalDownloads += songsUrl.length;
	    totalDownloadsItem.text(totalDownloads);
            $.each(songsUrl, function(index, value){
	 	chromeDownloadQueryAdd(index);   
	    });
	}
    });
    
}, 'html');

