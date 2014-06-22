/*** Init global variables ***/

var popupPageAvaliable = false;
var popupElements = {}; // popup.html elements
var totalDownloads = 0; // total download count
var radioSiteLink = "http://radio24.ua/";
var emailMeLink = "https://chrome.google.com/webstore/support/chmaodglbkpofamhgeeglifgddgbldif?hl=uk&gl=UA#question";
var songsData = { // current songs list
    list   : [], // songs list
    html   : '', // songs list html
    update : 0 // songs list last update
};
var downloadInProgress = false; // download status (display/hide download all songs link)
var downloadQueryList = []; // download songs query list
var chromeCurrentDownloadId = 0;
var downloadIndex = 0; // current download song index in query
var updateLiveTime = 1000 * 3600 * 2; // songs list live time in local storage
var contentAjaxTimeOut = 2000;
var playlistMaxSongsCount = 220;
var playlistAddSongsCount = 30;


/*** Custom chrome application functions ***/

// download files to radio24 folder and overwrite if exist
chrome.downloads.onDeterminingFilename.addListener ( function ( item, suggest ) {
    if(item.url.indexOf(radioSiteLink)+1) { // if file source is http://radio24.ua
        var downloadParams = {filename: 'radio24/', conflict_action : "overwrite", conflictAction : "overwrite"};
        try {
            var fileName = downloadQueryList[downloadIndex].name.trim().replace(/\r?\n|\r/gmi, '' ).replace(/[^A-zA-я\s-_]/gmi, ' ' ).replace(/\s+/g, ' ') +
                '.' + item.filename.replace(/^.*\./,'');
            downloadParams.filename +=  fileName;
            suggest ( downloadParams );
        } catch (error) {
            downloadParams.filename += item.filename;
            suggest ( downloadParams );
        }
    }
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

// open link in current chrome tab
function openLinkInCurrentTab ( url ) {
    chrome.tabs.update ( null, {url : url} );
}

// open link in new chrome tab
function openLinkInNewTab ( url ) {
    chrome.tabs.create({ url: url });
}

/*** Download process ***/

// check download process
chrome.downloads.onChanged.addListener ( function ( downloadDelta ) {
    if ( downloadDelta.state ) {
        if ( downloadDelta.state.current == "complete" && downloadInProgress ) {
            totalDownloads--;
            if(popupPageAvaliable) {
                popupElements.totalDownloadsItem.text ( totalDownloads );
            }
            updateBadgeCounter ( totalDownloads );
            if ( totalDownloads > 0 && downloadInProgress ) {
                downloadIndex++;
                startDownloadProccess ( downloadIndex );
            } else {
                downloadIndex = 0;
                downloadInProgress = false;
                downloadQueryList = [];
                deleteBadgeCounter ();
                toggleTotalDownloadAllSongs ( true );
            }
        }
    }
} );

// add to chrome download query
function chromeDownloadQueryAdd ( index, usePlayPlaylist ) {
    if(usePlayPlaylist) {
        if ( songsPlayData.list.length && songsPlayData.list[index] ) {
            downloadQueryList.push ( songsPlayData.list[index] );
        }
    } else {
        if ( songsData.list.length && songsData.list[index] ) {
            downloadQueryList.push ( songsData.list[index] );
        }
    }

    if ( !downloadInProgress ) {
        startDownloadProccess ( 0 );
        downloadInProgress = true;
    }
}

// start browser download process
function startDownloadProccess ( index ) {
    var downloadParams = {url : downloadQueryList[index].url, conflictAction : "overwrite"};
    toggleTotalDownloadAllSongs ( false );
    chrome.downloads.download ( downloadParams, function ( downloadId ) {
        chromeCurrentDownloadId = downloadId;
    } );
}

// stop browser download process
function stopDownloadProcess () {
    if ( downloadInProgress ) {
        downloadQueryList = [];
        totalDownloads = 0;
        toggleTotalDownloadAllSongs ( true );
        deleteBadgeCounter();
        downloadInProgress = false;
        chrome.downloads.cancel ( chromeCurrentDownloadId );
    }
}

/*** Render functions ***/

// toggle visible download all link
function toggleTotalDownloadAllSongs ( showDownloadLink ) {
    if(popupPageAvaliable) {
        if ( showDownloadLink ) {
            popupElements.totalDownloadContainer.fadeOut ( 50, function() {
                popupElements.downloadAllSongsContainer.fadeIn( 250 );
            } );
        } else {
            popupElements.downloadAllSongsContainer.fadeOut ( 250, function() {
                popupElements.totalDownloadContainer.fadeIn ( 250 );
            } );
        }
    }
}

// toggle visible song counter
function toggleSongsCounter ( showCounter ) {
    if ( showCounter ) {
        popupElements.songsCounterContainerItem.show ( 0 );
    } else {
        popupElements.songsCounterContainerItem.hide ( 0 );
    }
}

//
function toggleSongsUpdateTime ( showTime ) {
    if ( showTime ) {
        popupElements.lastUpdateContainerItem.show ( 0 );
        popupElements.syncSongsControl.show ( 0 );
        popupElements.emailMe.show ( 0 );
    } else {
        popupElements.lastUpdateContainerItem.hide ( 0 );
        popupElements.syncSongsControl.hide ( 0 );
        popupElements.emailMe.hide ( 0 );
        togglePlaylistPlayerAddSongs(false, false);
    }
}

// render songs list counter
function updateSongsListCounter ( value ) {
    if(value >= playlistMaxSongsCount) {
        togglePlaylistPlayerAddSongs(false, false);
    } else {
        togglePlaylistPlayerAddSongs(true, true);
    }
    popupElements.songsCounterItem.text ( value );
    toggleSongsCounter ( true );
}

// toggle playlist add songs buttons html
function togglePlaylistPlayerAddSongs ( showButton, animate ) {
    if(animate) {
        if ( showButton ) {
            popupElements.playlistPlayerAddSongs.fadeIn(400);
        } else {
            popupElements.playlistPlayerAddSongs.fadeOut(400);
        }
    } else {
        if ( showButton ) {
            popupElements.playlistPlayerAddSongs.show(0);
        } else {
            popupElements.playlistPlayerAddSongs.hide(0);
        }
    }
}

// update total downloads
function updateTotalDownloads ( value ) {
    popupElements.totalDownloadsItem.text ( value );
    updateBadgeCounter ( value );
}

// update last songs list upload date
function updateLastSongsListUploadDate ( timestamp ) {
    popupElements.lastUpdateItem.text ( getCurrentDateTime ( timestamp ) );
    toggleSongsUpdateTime ( true );
}

//function get current format date time
function getCurrentDateTime ( timestamp ) {
    var date = new Date ( parseInt ( timestamp ) );
    var dateData = {
        Y             : date.getFullYear (),
        m             : parseInt(date.getMonth ()) + 1,
        d             : date.getDate (),
        h             : date.getHours (),
        i             : date.getMinutes (),
        s             : date.getSeconds ()
    };
    for ( var index in  dateData ) {
        dateData[index] = dateData[index] < 10 ? '0' + dateData[index] : dateData[index];
    }
    return dateData.d + '/' + dateData.m + ' ' + dateData.h + ':' + dateData.i + ':' + dateData.s;
}

/*** Songs list local storage ***/

// add songs list to storage
function saveDataToStorage (saveSongsPlayData) {
    var songsSource = saveSongsPlayData ? songsPlayData : songsData;
    if ( localStorage.songsData = JSON.stringify ( songsSource.list ) ) {
        localStorage.songsDataUpdate = songsSource.update.toString ();
    }
}

// check if storage songs list need update
function checkStorageDataValid () {
    var result = false;
    if ( checkStorageDataExist ) {
        var storageData = getStorageData ();
        var currentTimestamp = parseInt ( new Date ().getTime () );
        var updateTimestamp = parseInt ( storageData.update ) + updateLiveTime; // 3 hours live time
        if ( currentTimestamp < updateTimestamp ) {
            result = true;
        }
    }
    return result;
}

// check if song list exist in storage
function checkStorageDataExist () {
    return (localStorage.songsData && localStorage.songsDataUpdate) ? true : false;
}

// get storage songs list
function getStorageData () {
    return {
        data   : localStorage.songsData,
        update : localStorage.songsDataUpdate
    };
}

/*** Online player functions ***/

// check online player state
function checkOnlinePlayerState () {
    var showPlayButton = true;
    if ( isPlayerPlaying ( onlinePlayerInstance ) ) {
        showPlayButton = false;
    }
    toggleOnlinePlayerButtonState ( showPlayButton );
}

// display online player state
function toggleOnlinePlayerButtonState ( showPlayButton ) {
    if ( showPlayButton ) {
        popupElements.onlinePlayerPause.hide ( 0 );
        popupElements.onlinePlayerPlay.show ( 0 );
    } else {
        popupElements.onlinePlayerPlay.hide ( 0 );
        popupElements.onlinePlayerPause.show ( 0 );
    }
}

// display playlist player current song info
function changePlayerPlaylistCurrentSong(index, animate) {
    var songInfo = songsPlayData.list[index];
    if(popupPageAvaliable) {
        if(animate) {
            popupElements.playlistPlayerCurrentSongDownload.fadeOut(100);
            popupElements.playlistPlayerCurrentSongName.slideUp(300, function() {
                setPlayerPlaylistCurrentSongData(songInfo, index);
                popupElements.playlistPlayerCurrentSongName.slideDown(300, function() {
                    popupElements.playlistPlayerCurrentSongDownload.fadeIn(100);
                });
            });
        } else {
            popupElements.playlistPlayerCurrentSongDownload.hide(0);
            popupElements.playlistPlayerCurrentSongName.hide(0, function() {
                setPlayerPlaylistCurrentSongData(songInfo, index);
                popupElements.playlistPlayerCurrentSongName.show(0, function() {
                    popupElements.playlistPlayerCurrentSongDownload.show(0);
                });
            });
        }
    }
}

// ste playlist player current song data: name, search index, donwload url
function setPlayerPlaylistCurrentSongData (songInfo, index) {
    if(songInfo) {
        popupElements.playlistPlayerCurrentSongName.text(songInfo.name);
        popupElements.playlistPlayerCurrentSongDownload.attr('song-url', songInfo.url);
        popupElements.playlistPlayerCurrentSongDownload.attr('song-name', songInfo.name);
        popupElements.playlistPlayerCurrentSongDownload.attr('song-index', index);
        popupElements.playlistPlayerCurrentSongName.attr('data-seach-index', index);
        popupElements.playlistPlayerCurrentSongSearchVk.attr('data-seach-index', index);
        popupElements.playlistPlayerCurrentSongSearchLfm.attr('data-seach-index', index);
    }
}

/*** Playlist player functions ***/

// play playlist song
function playlistPlayerPlay ( songIndex, manualSongsListClick ) {
    var playNewPlaylist = false;

    if ( songsData.update != songsPlayData.update ) {
        if(parseInt(songsPlayData.update)) {
            if(!manualSongsListClick) {
                songIndex = 0;
            }
        }
        playNewPlaylist = true;
        // update playlist play songs
        songsPlayData.list = songsData.list;
        songsPlayData.update = songsData.update;
    }

    var songInfo = songsPlayData.list[songIndex];
    if ( (currentPlaylistPlayIndex != songIndex) || playNewPlaylist ) {
        playlistPlayerInstance.src = songInfo.url;
        currentPlaylistPlayIndex = songIndex;
        changePlayerPlaylistCurrentSong(currentPlaylistPlayIndex, true);
    }
    currentPlaySongIndex = songIndex;
    playPlayer ( playlistPlayerInstance );

    return currentPlaySongIndex;
}

function onPopupCloseHandler () {
    setPlaylistPlayerEndBackground ();
    playlistPlayerInstance.ontimeupdate = null;
    popupPageAvaliable = false;
}