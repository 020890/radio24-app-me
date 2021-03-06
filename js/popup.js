/*** Application ***/
window.onload = function () {

    /*** Events handler ***/

        // player playlist download song link
    $ ( document ).on ( 'click', '.playlist-player-download-track', function ( event ) {
        event.preventDefault ();
        var index = parseInt($ ( this ).attr ( 'song-index' ));
        var usePlayPlaylist = parseInt($ ( this ).attr ( 'data-download-current' )) ? true : false;
        if ( index >= 0 ) {
            bgPage.updateTotalDownloads ( (++bgPage.totalDownloads) );
            bgPage.chromeDownloadQueryAdd ( index, usePlayPlaylist ); // add song to download query
        }
    } );

    // player playlist download all songs link
    $ ( document ).on ( 'click', '#player-playlist-download-all-songs', function ( event ) {
        event.preventDefault ();
        if ( bgPage.songsData.list.length ) {
            bgPage.updateTotalDownloads ( (bgPage.totalDownloads += bgPage.songsData.list.length) );
            $.each ( bgPage.songsData.list, function ( index, value ) { // add songs to download query
                bgPage.chromeDownloadQueryAdd ( index, false );
            } );
        }
    } );

    // logo link to main site
    $ ( document ).on ( 'click', '#popup-logo', function ( event ) {
        event.preventDefault ();
        bgPage.openLinkInNewTab ( bgPage.radioSiteLink );
    } );

    // email me link
    $ ( document ).on ( 'click', '#email-me', function ( event ) {
        event.preventDefault ();
        bgPage.openLinkInNewTab ( bgPage.emailMeLink );
    } );

    // online player play button click
    $ ( document ).on ( 'click', '#online-player-play', function ( event ) {
        event.preventDefault ();
        bgPage.popupElements.onlinePlayerPlay.hide ( 0 );
        bgPage.popupElements.onlinePlayerPause.show ( 0 );

        toggleCurrentSongPlay(false);

        // off playlist player
        togglePlaylistPlayerPlay ( true, -1 );
        if(bgPage.isPlayerPlaying(bgPage.playlistPlayerInstance)) {
            bgPage.pausePlayer ( bgPage.playlistPlayerInstance );
        }
        bgPage.playPlayer ( bgPage.onlinePlayerInstance );
    } );

    // online player pause button click
    $ ( document ).on ( 'click', '#online-player-pause', function ( event ) {
        event.preventDefault ();
        offOnlinePlayer ();
    } );

    // online player playlist disable volume on button click
    $ ( document ).on ( 'click', '#online-player-volume-off', function ( event ) {
        event.preventDefault ();
        bgPage.popupElements.onlinePlayerVolumeOff.hide ( 0 );
        bgPage.popupElements.onlinePlayerVolumeOn.show ( 0 );
        bgPage.lastSetOnValue = bgPage.getPlayerVolume ();
        bgPage.setPlayerVolume ( 0 );
        bgPage.popupElements.onlinePlayerVolumeSliderProgress.slider ( 'value', 0 );
    } );

    // online player playlist enable volume on button click
    $ ( document ).on ( 'click', '#online-player-volume-on', function ( event ) {
        event.preventDefault ();
        bgPage.popupElements.onlinePlayerVolumeOff.show ( 0 );
        bgPage.popupElements.onlinePlayerVolumeOn.hide ( 0 );
        bgPage.setPlayerVolume ( bgPage.lastSetOnValue );
        bgPage.popupElements.onlinePlayerVolumeSliderProgress.slider ( 'value', bgPage.lastSetOnValue * 100 );
    } );

    // playlist player add songs
    $ ( document ).on ( 'click', '#playlist-player-add-songs', function ( event ) {
        event.preventDefault ();
        if(bgPage.songsData.list.length < bgPage.playlistMaxSongsCount) {
            var startTrackIndex = bgPage.songsData.list.length;
            var addSongsCount = bgPage.playlistAddSongsCount;
            var radioSiteAddSongsLink = bgPage.radioSiteLink + "loadMoreSongs.ajx?playlistType=RECOMMENDED&startRowAudio=" + (parseInt(startTrackIndex) + 2) + "&maxRowsAudio=" + addSongsCount + "&aaxmlrequest=true&aazones=playerLoadMoreZone";
            bgPage.togglePlaylistPlayerAddSongs(false, true);
            $.get ( radioSiteAddSongsLink, function ( data ) { // get additional playlist data
                var addSongsData = parseSiteTrackList ( data, bgPage.songsData.update, startTrackIndex );
                var songsContainer = bgPage.popupElements.resultItem;
                var songsList = bgPage.popupElements.resultList;
                var playlistPlayerPlaying = bgPage.isPlayerPlaying(bgPage.playlistPlayerInstance);
                    $.each(addSongsData.list, function( index, value ) {
                        if(bgPage.songsData.update == bgPage.songsPlayData.update) {
                            if(playlistPlayerPlaying) {
                                bgPage.songsPlayData.list.push(value);
                            } else {
                                bgPage.songsData.list.push(value);
                            }
                        } else {
                            bgPage.songsData.list.push(value);
                        }
                    });

                    songsList.append(addSongsData.html);
                    songsContainer.mCustomScrollbar ( "update" );
                    if(bgPage.songsData.update == bgPage.songsPlayData.update) {
                        if(playlistPlayerPlaying) {
                            bgPage.songsPlayData.html += addSongsData.html;
                            bgPage.updateSongsListCounter ( bgPage.songsPlayData.list.length );
                            bgPage.saveDataToStorage (true);
                        } else {
                            bgPage.songsData.html += addSongsData.html;
                            bgPage.updateSongsListCounter ( bgPage.songsData.list.length );
                            bgPage.saveDataToStorage ();
                        }
                    } else {
                        bgPage.songsData.html += addSongsData.html;
                        bgPage.updateSongsListCounter ( bgPage.songsData.list.length );
                        bgPage.saveDataToStorage ();
                    }

                    bgPage.updateLiveTime += (1000 * 3600 * 2); // next update time + 2 hours
                    bgPage.popupElements.lastUpdateContainerItem.attr('title', 'Автообновление каждые ' + parseInt(bgPage.updateLiveTime / 3600 / 1000) + 'ч.');
            }, 'html' );
        }
    } );

    // online player playlist sync on button click
    $ ( document ).on ( 'click', '#playlist-player-sync-songs-on', function ( event ) {
        event.preventDefault ();
        rotateHtmlElement ( $ ( this ) );
        updateSongsDataList ( false, true );
    } );

    // online player playlist play item on button click
    $ ( document ).on ( 'click', '.playlist-player-song-play-button', function ( event ) {
        event.preventDefault ();
        var songIndex = $ ( this ).attr ( 'song-id' );
        togglePlaylistPlayerPlay ( false, songIndex );
        //togglePlaylistPlayerNextPrev(true);
        offOnlinePlayer ();
        bgPage.playlistPlayerPlay ( songIndex, true );
    } );

    // online player playlist pause item on button click
    $ ( document ).on ( 'click', '.playlist-player-song-pause-button', function ( event ) {
        event.preventDefault ();
        var songIndex = $ ( this ).attr ( 'song-id' );
        if(bgPage.isPlayerPlaying(bgPage.playlistPlayerInstance)) {
            bgPage.pausePlayer ( bgPage.playlistPlayerInstance );
        }
        togglePlaylistPlayerPlay ( true, songIndex );
        //togglePlaylistPlayerNextPrev(false);
    } );

    // popup close on button click
    $ ( document ).on ( 'click', '#popup-close', function ( event ) {
        event.preventDefault ();
        closePopupPage ();
    } );

    // online player playlist replay on button click
    $ ( document ).on ( 'click', '#playlist-player-replay', function ( event ) {
        event.preventDefault ();
        bgPage.playlistPlayerInstance.currentTime = 0;
    } );

    // online player playlist download top on button click
    $ ( document ).on ( 'click', '#playlist-player-download-stop', function ( event ) {
        event.preventDefault ();
        bgPage.stopDownloadProcess ();
    } );

    // online player playlist previous on button click
    $ ( document ).on ( 'click', '#playlist-player-prev', function ( event ) {
        event.preventDefault ();
        onPlaylistPlayerSongNextPrevPopup(true);
    } );

    // online player playlist next on button click
    $ ( document ).on ( 'click', '#playlist-player-next', function ( event ) {
        event.preventDefault ();
        onPlaylistPlayerSongNextPrevPopup(false);
    } );

    // online player playlist play top on button click
    $ ( document ).on ( 'click', '#playlist-player-play-top', function ( event ) {
        event.preventDefault ();
        var songIndex = bgPage.currentPlaySongIndex;
            songIndex = bgPage.playlistPlayerPlay ( songIndex );
        togglePlaylistPlayerPlay ( false, songIndex );
        //togglePlaylistPlayerNextPrev(true);
        offOnlinePlayer ();
    } );

    // online player playlist pause top on button click
    $ ( document ).on ( 'click', '#playlist-player-pause-top', function ( event ) {
        event.preventDefault ();
        var songIndex = bgPage.currentPlaySongIndex;
        if(bgPage.isPlayerPlaying(bgPage.playlistPlayerInstance)) {
            bgPage.pausePlayer ( bgPage.playlistPlayerInstance );
        }
        togglePlaylistPlayerPlay ( true, songIndex );
        //togglePlaylistPlayerNextPrev(false);
    } );

    $( document ).on('click', '.playlist-player-song-search-vk, ' +
        '                      .playlist-player-song-search-lastfm, ' +
        '                      .playlist-player-song-search-youtube', function(event) {
        event.preventDefault ();
        var resource = parseInt($(this ).attr('data-seach-type'));
        var songIndex = parseInt($(this ).attr('data-seach-index'));
        var songCurrent = parseInt($(this ).attr('data-seach-current'));
        var query = '';
        if(songCurrent) {
            query = bgPage.songsPlayData.list[songIndex].name;
        } else {
            query = bgPage.songsData.list[songIndex].name;
        }
        plyalistPlayerSearch(resource, query);
    });

    /*** End Events handler ***/

        // close popup page handler
    window.onunload = function () {
        bgPage.onPopupCloseHandler ();
    };

    // close popup page button handler
    function closePopupPage () {
        window.close ();
    }

    // init application
    function init () {
        initVars ();
        refreshView ();
        var useStorageData = false;
        if ( bgPage.checkStorageDataExist () && bgPage.checkStorageDataValid () ) {
            useStorageData = true;
        }
        updateSongsDataList ( useStorageData );
    }

    // init vars
    function initVars () {
        bgPage.popupElements = {
            onlinePlayerPlay                     : $ ( '#online-player-play' ),
            onlinePlayerPause                    : $ ( '#online-player-pause' ),
            onlinePlayerVolumeOff                : $ ( '#online-player-volume-off' ),
            onlinePlayerVolumeOn                 : $ ( '#online-player-volume-on' ),
            onlinePlayerVolumeSliderProgress     : $ ( '#online-player-volume-slider-progress' ),
            resultItem                           : $ ( '#playlist-player-playlist' ),
            resultList                           : $ ( '#playlist-player-playlist-list' ),
            totalDownloadContainer               : $ ( '.playlist-player-total-downloads-container' ),
            totalDownloadsItem                   : $ ( '#playlist-player-total-downloads' ),
            downloadAllSongsContainer            : $ ( '#player-playlist-download-all-songs' ),
            songsCounterItem                     : $ ( '#playlist-player-total-tacks-count' ),
            songsCounterContainerItem            : $ ( '.playlist-player-total-tacks' ),
            lastUpdateItem                       : $ ( '#playlist-player-last-update-time' ),
            lastUpdateContainerItem              : $ ( '.playlist-player-last-update' ),
            syncSongsControl                     : $ ( '.playlist-player-sync-songs-control' ),
            syncSongsOn                          : $ ( '#playlist-player-sync-songs-on' ),
            playlistPlayerPositionSlider         : $ ( '.playlist-player-position-slider' ),
            playlistPlayerPositionSliderProgress : $ ( '#playlist-player-position-slider-progress' ),
            playlistPlayerReplay                 : $ ( '#playlist-player-replay' ),
            downloadStopButton                   : $ ( '#playlist-player-download-stop' ),
            playlistPlayerPrev                   : $ ( '#playlist-player-prev' ),
            playlistPlayerNext                   : $ ( '#playlist-player-next' ),
            playlistPlayerTopControl             : $ ( '.playlist-player-top-control-container' ),
            playlistPlayerPlayTop                : $ ( '#playlist-player-play-top' ),
            playlistPlayerPauseTop               : $ ( '#playlist-player-pause-top' ),
            emailMe                              : $ ( '#email-me' ),
            playlistPlayerAddSongs               : $ ( '#playlist-player-add-songs' ),
            playlistPlayerCurrentSongContainer   : $ ( '.playlist-player-current-song-container' ),
            playlistPlayerCurrentSongItem        : $ ( '.playlist-player-current-song-item' ),
            playlistPlayerCurrentSongName        : $ ( '.playlist-player-current-song-container .playlist-player-song-search-youtube' ),
            playlistPlayerCurrentSongSearchVk    : $ ( '.playlist-player-current-song-container .playlist-player-song-search-vk' ),
            playlistPlayerCurrentSongSearchLfm   : $ ( '.playlist-player-current-song-container .playlist-player-song-search-lastfm' ),
            playlistPlayerCurrentSongDownload    : $ ( '.playlist-player-current-song-container .playlist-player-download-track' )
        };
    }

    // refresh view elements style
    function refreshView () {
        if ( bgPage.downloadInProgress ) { // show/hide download all link
            bgPage.popupElements.totalDownloadsItem.text ( bgPage.totalDownloads );
            bgPage.toggleTotalDownloadAllSongs ( false );
        } else {
            bgPage.toggleTotalDownloadAllSongs ( true );
        }
        bgPage.toggleSongsCounter ( false ); // show/hide song counter
        bgPage.toggleSongsUpdateTime ( false ); // show/hide update time
    }

    // render songs data
    function render ( data, refresh, isStorageData ) {
        var songsContainer = bgPage.popupElements.resultItem;
        var songsList = bgPage.popupElements.resultList;
        if(!isStorageData) {
            bgPage.updateLiveTime = (1000 * 3600 * 2); // next update time +2 hours
        }
        bgPage.popupElements.lastUpdateContainerItem.attr('title', 'Автообновление каждые ' + parseInt(bgPage.updateLiveTime / 3600 / 1000) + 'ч.');

        if ( refresh ) {
            refreshView ();
            songsContainer.slideUp ( 500, function ( event ) {
                songsList.html ( '' );
                songsList.html ( data.html );
                songsContainer.mCustomScrollbar ( "update" );
                //render playlist player play button and progress bar
                checkPlaylistPlayerState ();
                setTimeout(function(){
                    renderSongsListHtml ( data, songsContainer, true );
                }, 150);
            } );
        } else {
            songsList.html ( data.html );
            songsContainer.mCustomScrollbar ();
            //render playlist player play button and progress bar
            checkPlaylistPlayerState ();
            renderSongsListHtml ( data, songsContainer, !isStorageData );
        }
    }

    // render songs list html
    function renderSongsListHtml ( data, songsContainer, animate ) {
        if(animate) { // use slide up animation
            songsContainer.slideDown ( 500, function ( event ) {
                bgPage.updateSongsListCounter ( data.list.length );
                bgPage.updateLastSongsListUploadDate ( data.update );
                $('html' ).css('height', 'auto');
            } );
        } else {
            songsContainer.show ( 0, function ( event ) {
                bgPage.updateSongsListCounter ( data.list.length );
                bgPage.updateLastSongsListUploadDate ( data.update );
                $('html' ).css('height', 'auto');
            } );
        }
    }

    // check online player state
    function checkPlaylistPlayerState () {
        resetPlayListPlayerPlay ();
        var index = -1;
        if ( bgPage.isPlayerPlaying ( bgPage.playlistPlayerInstance ) && ( bgPage.songsData.update == bgPage.songsPlayData.update ) ) {
            index = bgPage.currentPlaySongIndex;
        }

        var playListPlayItem = $ ( '.playlist-player-song-play-button[song-id=' + index + ']' );
        var playListPauseItem = $ ( '.playlist-player-song-pause-button[song-id=' + index + ']' );

        if ( playListPlayItem && playListPauseItem ) {
            if ( index >= 0 ) {
                if ( bgPage.songsData.update == bgPage.songsPlayData.update ) {
                    playListPauseItem.parent().parent().addClass('playlist-player-track-item-current');
                    playListPlayItem.hide ( 0 );
                    playListPauseItem.show ( 0 );
                    scrollToPlaySong();
                }
            }
        }

        if(bgPage.displayPlaylistPlayer) {
            toggleCurrentSongPlay(true, false);
        }

    }

    // render online player elements
    function renderOnlinePlayer () {
        // set online player error handler
        bgPage.onlinePlayerInstance.onerror = onlinePlayerErrorPopup;
        bgPage.onlinePlayerInstance.onstalled = onlinePlayerErrorPopup;
        // render online player play button
        bgPage.checkOnlinePlayerState ();
        // render online player voice switcher
        bgPage.popupElements.onlinePlayerVolumeOff.show ( 0 );
        // render online player volume
        var currentOnlinePlayerVolume = bgPage.getPlayerVolume ();
        bgPage.popupElements.onlinePlayerVolumeSliderProgress.slider ( {
            value       : (currentOnlinePlayerVolume * 100),
            orientation : "horizontal",
            range       : "min",
            animate     : true,
            change      : function ( event, ui ) {
                if ( parseInt ( ui.value ) ) {
                    bgPage.popupElements.onlinePlayerVolumeOff.show ( 0 );
                    bgPage.popupElements.onlinePlayerVolumeOn.hide ( 0 );
                }
                bgPage.setPlayerVolume ( (parseFloat ( ui.value ) / 100).toFixed ( 2 ) );
            }
        } );

        var sliderValue = 0;
        if(bgPage.displayPlaylistPlayer) {
                sliderValue = parseInt(bgPage.playlistPlayerInstance.currentTime / bgPage.playlistPlayerInstance.duration * 100);
            if(isNaN(sliderValue)) {
                sliderValue = 0;
            }
            else if(sliderValue < 0) {
                sliderValue = 0;
            } else if(sliderValue > 100) {
                sliderValue = 100;
            }
        }
        // render playlist player position
        bgPage.popupElements.playlistPlayerPositionSliderProgress.slider ( {
            value       : sliderValue,
            orientation : "horizontal",
            range       : "min",
            animate     : true,
            slide       : function ( event, ui ) {
                if ( parseInt ( ui.value ) ) {
                    bgPage.playlistPlayerInstance.currentTime = parseInt ( bgPage.playlistPlayerInstance.duration / 100 * parseInt ( ui.value ) );
                }
            }
        } );

        // set playlist player error handler
        bgPage.playlistPlayerInstance.onerror = playlistPlayerErrorPopup;
        bgPage.playlistPlayerInstance.onstalled = playlistPlayerErrorPopup;

        // update playlist progress bar value
        bgPage.playlistPlayerInstance.ontimeupdate = onPlaylistPlayerTimeUpdate;

        // playlist player song end
        bgPage.playlistPlayerInstance.onended = onPlaylistPlayerSongNextPrevPopup;

        // render prev next buttons
        if(bgPage.isPlayerPlaying(bgPage.onlinePlayerInstance)) {
            togglePlaylistPlayerNextPrev(false);
        } else if(bgPage.isPlayerPlaying(bgPage.playlistPlayerInstance)) {
            togglePlaylistPlayerNextPrev(true);
        }

        // playlist player change current track info
        bgPage.changePlayerPlaylistCurrentSong(bgPage.currentPlaySongIndex, false);
    }

    // update songs data list
    function updateSongsDataList ( useStorage, refresh ) {
        if(!refresh) {
            renderOnlinePlayer ();
        }
        if ( useStorage ) {
            var storageData = bgPage.getStorageData ();
            bgPage.songsData = parseStorageTrackList ( storageData.data, storageData.update );
            if(!bgPage.songsPlayData) {
                bgPage.songsPlayData.list = bgPage.songsData.list;
                bgPage.songsPlayData.update = bgPage.songsData.update;
            }
            render ( bgPage.songsData, refresh, true );
        } else {
            $.get ( bgPage.radioSiteLink, function ( data ) { // refresh playlist data
                bgPage.songsData = parseSiteTrackList ( data, (new Date ()).getTime () );
                bgPage.saveDataToStorage ();
                render ( bgPage.songsData, refresh, false );
            }, 'html' );
        }
    }

    /*** Track parser ***/

    // parse playlist content from site
    function parseSiteTrackList ( data, update, startIndex ) {
        var songsHtml = '';
        var songsList = [];

        var songs = $ ( '.tab-content-item', data );
        songs.each ( function ( index ) {
            var itemIndex = parseInt(startIndex || 0) + index;

            var songName = '';
            var songUrl = '';

            var songData = $ ( this ).find ( '.left:eq(0)' );
            var songTitle = $ ( this ).find ( '.left:eq(1)' );

            if ( songData.length ) {
                var songItemPath = $ ( this ).find ( "input" ).first ().val ();
                songUrl = bgPage.radioSiteLink + songItemPath;
            }

            if ( songTitle.length ) {
                var songPerformer = $ ( this ).find ( ".performer" ).text ();
                songName = $ ( this ).find ( ".song" ).text ().trim ();
                if ( songPerformer ) {
                    songName = (songPerformer + ' - ' + songName).trim ();
                }
            }

            if ( songUrl && songName ) {
                var songInfo = {url : songUrl, name : songName};
                songsList.push ( songInfo );
                songsHtml += getSongsListItemHtml ( songInfo, itemIndex );
            }
        } );

        return {html : songsHtml, list : songsList, update : update};
    }

    // parse playlist content from storage
    function parseStorageTrackList ( songs, update ) {
        var songsHtml = '';
        var songsList = JSON.parse ( songs );
        $.each ( songsList, function ( index, songInfo ) {
            songsHtml += getSongsListItemHtml ( songInfo, index );
        } );
        return {html : songsHtml, list : songsList, update : update};
    }

    // search social media by track name
    function plyalistPlayerSearch ( search, query ) {
        var domain = '';
        var uri = '';
        if(search == 1) { // vk search
            domain = 'http://vk.com';
            uri = '/search?c[q]=' + query + '&c[section]=audio';
        } else if(search == 2) { // lastfm search
            domain = 'http://www.lastfm.ru';
            uri = '/search?q=' + query + '&type=all';
        } else { // youtube search
            domain = 'http://www.youtube.com';
            uri = '/results?search_query=' + query;
        }
        var resultUrl = domain + uri;
        bgPage.openLinkInNewTab ( resultUrl );
        return false;
    }

    // get songs list item html
    function getSongsListItemHtml ( songInfo, index ) {
        var imgPlayTrack = '<img class="playlist-player-song-play-button" src="../images/playlist-play.png" song-id="' + index + '">';
        var imgStopTrack = '<img class="playlist-player-song-pause-button" src="../images/playlist-pause.png" song-id="' + index + '">';
        var imgDownloadTrack = imgPlayTrack + imgStopTrack + '<img song-index="' + index + '" song-name="' + songInfo.name + '" data-download-current="0" song-url="' + songInfo.url + '" class="playlist-player-download-track" src="images/icon_16.png" title="Скачать трек">';
        var searchButtons = '<div class="playlist-player-song-search"><img src="images/search-vk.png" data-seach-type="1" data-seach-current="0" data-seach-index="' + index + '" class="playlist-player-song-search-vk" title="Найти Вконтакте" alt="Найти Вконтакте"><img src="images/search-lastfm.png" data-seach-type="2" data-seach-current="0" data-seach-index="' + index + '"  class="playlist-player-song-search-lastfm" title="Найти LastFM" alt="Найти LastFM"></div>';
        var songListItemHtml = '<div class="playlist-player-track-item"><span class="playlist-player-track-item-number">' + imgDownloadTrack + ' ' + (parseInt ( index ) + 1) + '.</span>' + ' <a href="#" class="playlist-player-song-search-youtube" data-seach-type="0" data-seach-current="0" data-seach-index="' + index + '" target="_blank">' + songInfo.name + '</a>' + searchButtons + '</div>';
        return songListItemHtml;
    }

    // rotate html element
    function rotateHtmlElement ( element ) {
        element.attr ( 'rotate-angle', (parseInt ( element.attr ( 'rotate-angle' ) ) + 360) );
        element.clearQueue ().animate ( {deg : element.attr ( 'rotate-angle' )}, {
            duration : 2000,
            step     : function ( now ) {
                element.css ( {
                    transform : 'rotate(' + now + 'deg)'
                } );
            }
        } );
    }

    // toggle playlist play and stop buttons html and song progress html
    function togglePlaylistPlayerPlay ( playState, index ) {
        var playListPlayItem = $ ( '.playlist-player-song-play-button[song-id=' + index + ']' );
        var playListPauseItem = $ ( '.playlist-player-song-pause-button[song-id=' + index + ']' );

        if ( bgPage.currentPlaylistPlayIndex != index ) {
            resetPlayListPlayerPlay ();
            if ( index >= 0 ) {
                bgPage.popupElements.playlistPlayerPositionSliderProgress.slider ( 'value', 0 );
            }
        }

        if ( index < 0 ) {
            toggleCurrentSongPlay(false);
        } else {
            toggleCurrentSongPlay(true, true);
        }

        if ( playListPlayItem && playListPauseItem ) {
            if ( playState ) {
                playListPauseItem.hide ( 0 );
                playListPlayItem.show ( 0 );
                setTimeout(function(){
                    bgPage.popupElements.playlistPlayerPauseTop.fadeOut(200, function() {
                        bgPage.popupElements.playlistPlayerPlayTop.fadeIn(200);
                    });
                }, 70);

            } else {

                    playListPauseItem.parent().parent().addClass('playlist-player-track-item-current');
                    playListPlayItem.hide ( 0 );
                    playListPauseItem.show ( 0 );
                    setTimeout(function(){
                        bgPage.popupElements.playlistPlayerPlayTop.fadeOut(200, function(){
                            bgPage.popupElements.playlistPlayerPauseTop.fadeIn(200);
                        });
                    }, 70);
            }
        }
    }

    // reset playlist play and stop buttons html
    function resetPlayListPlayerPlay () {
        var playListPlayItems = $ ( '.playlist-player-song-play-button' );
        var playListPauseItems = $ ( '.playlist-player-song-pause-button' );
        var trackListItems = $('.playlist-player-track-item' ).removeClass('playlist-player-track-item-current');
        if ( playListPlayItems && playListPauseItems ) {
            playListPauseItems.hide ( 0 );
            playListPlayItems.show ( 0 );
            //bgPage.popupElements.playlistPlayerPauseTop.hide(0);
            //bgPage.popupElements.playlistPlayerPlayTop.hide(0);
        }
    }

    // off online player
    function offOnlinePlayer () {
        if(bgPage.isPlayerPlaying(bgPage.onlinePlayerInstance)) {
            bgPage.pausePlayer ( bgPage.onlinePlayerInstance );
        }
        bgPage.popupElements.onlinePlayerPause.hide ( 0 );
        bgPage.popupElements.onlinePlayerPlay.show ( 0 );
    }

    // playlist song end handler popup
    function onPlaylistPlayerSongNextPrevPopup () {
        resetPlayListPlayerPlay ();
        bgPage.popupElements.playlistPlayerPositionSliderProgress.slider ( 'value', 0 );

        if ( bgPage.songsPlayData.list.length ) {

            var decrementDirection = false;
            if(arguments.length) {
                if(typeof(arguments[0]) == 'boolean') {
                    decrementDirection = arguments[0];
                }
            }

            if(decrementDirection) { //play prev song
                bgPage.currentPlaySongIndex--;
            } else { //play next song
                bgPage.currentPlaySongIndex++;
            }

            if ( (bgPage.currentPlaySongIndex == bgPage.songsPlayData.list.length) || (bgPage.songsData.update != bgPage.songsPlayData.update) ) {
                bgPage.currentPlaySongIndex = 0;
            } else if(bgPage.currentPlaySongIndex < 0) {
                if(bgPage.songsPlayData.list.length) {
                    bgPage.currentPlaySongIndex = bgPage.songsPlayData.list.length - 1;
                }
            }

            if ( bgPage.currentPlaySongIndex < bgPage.songsPlayData.list.length ) {
                togglePlaylistPlayerPlay ( false, bgPage.currentPlaySongIndex );
                offOnlinePlayer ();
                bgPage.playlistPlayerPlay ( bgPage.currentPlaySongIndex );
            }
        }
    }

    // scroll to start play song
    function scrollToPlaySong() {
        if(bgPage.displayPlaylistPlayer) {
            setTimeout(function() {
                if($(".playlist-player-track-item-current")) {
                    bgPage.popupElements.resultItem.mCustomScrollbar("scrollTo", ".playlist-player-track-item-current", {scrollInertia: 750});
                }
            }, 100);
        }
    }

    // online player error handler popup
    function onlinePlayerErrorPopup() {
        bgPage.pausePlayer(bgPage.onlinePlayerInstance);
        bgPage.popupElements.onlinePlayerPause.hide ( 0 );
        bgPage.popupElements.onlinePlayerPlay.show ( 0 );
    }

    // playlist player error handler popup
    function playlistPlayerErrorPopup() {
        bgPage.pausePlayer (bgPage.playlistPlayerInstance);
        resetPlayListPlayerPlay();
        bgPage.popupElements.playlistPlayerPauseTop.fadeOut ( 200, function() {
            bgPage.popupElements.playlistPlayerPlayTop.fadeIn ( 200 );
        } );
    }

    // playlist player time update handler popup
    function onPlaylistPlayerTimeUpdate () {
        bgPage.popupElements.playlistPlayerPositionSliderProgress.slider ( 'value', parseInt ( Math.ceil ( bgPage.playlistPlayerInstance.currentTime ) /
            Math.ceil ( bgPage.playlistPlayerInstance.duration ) * 100 ) );
    }

    // toggle playlist prev and next buttons html
    function togglePlaylistPlayerNextPrev ( showButtons ) {
        if ( showButtons ) {
            bgPage.popupElements.playlistPlayerPrev.fadeIn(500);
            bgPage.popupElements.playlistPlayerNext.fadeIn(500);
        } else {
            bgPage.popupElements.playlistPlayerPrev.fadeOut(500);
            bgPage.popupElements.playlistPlayerNext.fadeOut(500);
        }
    }

    // toggle playlist prev and next buttons html
    function toggleCurrentSongPlay ( showSongInfo, animate ) {
        if ( showSongInfo ) {
            if(animate) {
                bgPage.popupElements.playlistPlayerCurrentSongContainer.slideDown(300, function() {
                    setTimeout(function(){
                        togglePlaylistPlayerInterface ( true );
                    }, 50);
                });
            } else {
                bgPage.popupElements.playlistPlayerCurrentSongContainer.show(0);
                togglePlaylistPlayerInterface ( true );
            }
            bgPage.displayPlaylistPlayer = true;
        } else {
            togglePlaylistPlayerInterface ( false );
            setTimeout(function(){
                bgPage.popupElements.playlistPlayerCurrentSongContainer.slideUp(300);
            }, 50);
            bgPage.displayPlaylistPlayer = false;
        }
    }

    /**
     * toggle playlist current song top interface
     */
    function togglePlaylistPlayerInterface ( showSongInfo ) {
        if ( showSongInfo ) {
            bgPage.popupElements.playlistPlayerPositionSlider.show ( 0 );
            bgPage.popupElements.playlistPlayerReplay.show ( 0 );
            bgPage.popupElements.playlistPlayerTopControl.show ( 0 , function() {
                if(bgPage.isPlayerPlaying(bgPage.playlistPlayerInstance)) {
                    bgPage.popupElements.playlistPlayerPlayTop.fadeOut ( 200, function() {
                        bgPage.popupElements.playlistPlayerPauseTop.fadeIn ( 200 );
                    } );
                } else {
                    bgPage.popupElements.playlistPlayerPauseTop.fadeOut ( 200, function() {
                        bgPage.popupElements.playlistPlayerPlayTop.fadeIn ( 200 );
                    } );
                }
            } );
            bgPage.popupElements.playlistPlayerCurrentSongItem.show ( 0 );
            bgPage.popupElements.playlistPlayerPrev.show ( 0 );
            bgPage.popupElements.playlistPlayerNext.show ( 0 );
        } else {
            bgPage.popupElements.playlistPlayerPositionSlider.hide ( 0 );
            bgPage.popupElements.playlistPlayerTopControl.hide ( 0, function() {
                if(bgPage.isPlayerPlaying(bgPage.playlistPlayerInstance)) {
                    bgPage.popupElements.playlistPlayerPauseTop.fadeOut ( 200, function() {
                        bgPage.popupElements.playlistPlayerPlayTop.fadeIn ( 200 );
                    } );
                } else {
                    bgPage.popupElements.playlistPlayerPlayTop.fadeOut ( 200, function() {
                        bgPage.popupElements.playlistPlayerPauseTop.fadeIn ( 200 );
                    } );
                }
            } );
            bgPage.popupElements.playlistPlayerReplay.hide ( 0 );
            bgPage.popupElements.playlistPlayerCurrentSongItem.hide ( 0 );
            bgPage.popupElements.playlistPlayerPrev.hide ( 0 );
            bgPage.popupElements.playlistPlayerNext.hide ( 0 );
        }
    }

    /*** Start application ***/

    // get background.html scripts map
    var bgPage = chrome.extension.getBackgroundPage ();
    if(bgPage) {
        bgPage.popupPageAvaliable = true;
        $.ajaxSetup ( {timeout : bgPage.contentAjaxTimeOut} );
        // start init application
        init ();
    }
}