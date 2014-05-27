// get background.js map
var bgPage = chrome.extension.getBackgroundPage ();

// init vars
var resultItem = $ ( '#result' );
var totalDownloadsItem = $ ( '#total-downloads' );
var totalDownloadContainer = $ ( '#total-downloads-container' );
var downloadAllSongsContainer = $ ( '#download-all-songs' );
var songsCounterItem = $ ( '#total-tacks-in-list-count' );
var songsCounterContainerItem = $ ( '.total-tacks-in-list' );

// check download process
chrome.downloads.onChanged.addListener ( function ( downloadDelta ) {
    if ( downloadDelta.state ) {
        if ( downloadDelta.state.current == "complete" ) {
            bgPage.totalDownloads--;
            totalDownloadsItem.text ( bgPage.totalDownloads );
            bgPage.updateBadgeCounter ( bgPage.totalDownloads );
            if ( bgPage.totalDownloads > 0 && bgPage.downloadInProgress ) {
                bgPage.downloadIndex++;
                startDownloadProccess ( bgPage.downloadIndex );
            } else {
                bgPage.downloadIndex = 0;
                bgPage.downloadInProgress = false;
                bgPage.downloadQueryList = [];
                bgPage.deleteBadgeCounter ();
                toggleTotalDownloadAllSongs(true);
            }
        }
    }
} );

// toggle visible download all link
function toggleTotalDownloadAllSongs(showDownloadLink) {
    if(showDownloadLink) {
        downloadAllSongsContainer.css ( 'display', 'block' );
        totalDownloadContainer.css ( 'display', 'none' );
    } else {
        downloadAllSongsContainer.css ( 'display', 'none' );
        totalDownloadContainer.css ( 'display', 'block' );
    }
}

// toggle visible song counter
function toggleSongsCounter(showCounter) {
    if(showCounter) {
        songsCounterContainerItem.css ( 'display', 'block' );
    } else {
        songsCounterContainerItem.css ( 'display', 'none' );
    }
}


// add to chrome download query
function chromeDownloadQueryAdd ( index ) {
    if ( bgPage.songsData.list.length && bgPage.songsData.list[index] ) {
        bgPage.downloadQueryList.push ( bgPage.songsData.list[index] );
    }

    if ( !bgPage.downloadInProgress ) {
        startDownloadProccess ( 0 );
        bgPage.downloadInProgress = true;
    }
}

// start browser download process
function startDownloadProccess ( index ) {
    var downloadParams = {url : bgPage.downloadQueryList[index], conflictAction : "overwrite"};
        toggleTotalDownloadAllSongs(false);
        chrome.downloads.download ( downloadParams, function ( downloadId ) { } );
}

// parse playlist content
function parsePageTrackList ( data ) {
    var songsHtml = '';
    var songsList = [];

    var songs = $ ( '.tab-content-item', data );
    songs.each ( function ( index ) {
        var songName = '';
        var songUrl = '';

        var songData = $ ( this ).find ( '.left:eq(0)' );
        var songTitle = $ ( this ).find ( '.left:eq(1)' );

        if ( songData.length ) {
            var songItemPath = $ ( this ).find ( "input" ).first ().val ();
            songUrl = 'http://radio24.ua/' + songItemPath;
        }

        if ( songTitle.length ) {
            var songPerformer = $ ( this ).find ( ".performer" ).text ();
                songName = $ ( this ).find ( ".song" ).text ();
                if ( songPerformer ) {
                    songName = songPerformer + ' - ' + songName;
                }
        }

        if ( songUrl && songName ) {
            var imgDownloadTrack = '<img song-index="' + index + '" song-name="' + songName + '" song-url="' + songUrl + '" class="img-download-track" src="images/img.png" title="Скачать трек">';
                songsHtml += '<div class="track-list-item"><span class="track-list-item-number">' + imgDownloadTrack + ' ' + (parseInt ( index ) + 1) + '.</span>' + '<a href="' + songUrl + '" target="_blank">' + songName.trim () + '</a>' + '</div>';
                songsList.push ( songUrl );
        }
    } );

    return {html : songsHtml, list : songsList};
}

// update total downloads
function updateTotalDownloads ( value ) {
    totalDownloadsItem.text ( value );
    bgPage.updateBadgeCounter ( value );
}

// render songs data
function render ( data ) {
    resultItem.html ( data.html );
    resultItem.mCustomScrollbar ();
    resultItem.slideDown ( 500 );
    updateSongsListCounter ( data.list.length );
}

// render songs list counter
function updateSongsListCounter ( value ) {
    songsCounterItem.text ( value );
    toggleSongsCounter(true);
}

// init application
function init() {
    // refresh playlist data
    $.get ( bgPage.radioSiteLink, function ( data ) {
        bgPage.songsData = parsePageTrackList ( data );
        render ( bgPage.songsData );
    }, 'html' );
}


$ ( function () {

    // start init application
    init();

    // download song link
    $ ( document ).on ( 'click', '.img-download-track', function ( event ) {
        event.preventDefault ();
        var index = $ ( this ).attr ( 'song-index' );
        if ( index ) {
            updateTotalDownloads ( (++bgPage.totalDownloads) );
            chromeDownloadQueryAdd ( index ); // add song to download query
        }
    } );

    // download all songs link
    $ ( document ).on ( 'click', '#download-all-songs', function ( event ) {
        event.preventDefault ();
        if ( bgPage.songsData.list.length ) {
            updateTotalDownloads ( (bgPage.totalDownloads += bgPage.songsData.list.length) );
            $.each ( bgPage.songsData.list, function ( index, value ) { // add songs to download query
                chromeDownloadQueryAdd ( index );
            } );
        }
    } );

    // logo link to main site
    $ ( document ).on ( 'click', '.radio24-top-logo', function ( event ) {
        event.preventDefault ();
        bgPage.openLinkInCurrentTab ( bgPage.radioSiteLink );
    } );

} );