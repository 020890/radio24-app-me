var playerVolume = 0.75; // default volume value
var lastSetOnValue = playerVolume; // last set volume value
var songsPlayData = { // current playlist songs
    list   : [], // songs list
    update : 0 // songs last update
};
var displayPlaylistPlayer = false;

var defaultAppIcon = 'images/icon/icon_48.png';
var currentAppIcon = defaultAppIcon;

/*** Icon animation ***/
var iconAnimation = new iconAnimator(defaultAppIcon);
iconAnimation.set();

/*** Common players function ***/

// get player instance
function getPlayer ( id ) {
    return $ ( '#' + id )[0];
}

// get player volume
function getPlayerVolume () {
    var result = playerVolume;
    if ( onlinePlayerInstance ) {
        result = onlinePlayerInstance.volume;
    }
    return result;
}

// set player volume
function setPlayerVolume ( value ) {
    if ( onlinePlayerInstance ) {
        try {
            value = parseFloat ( value );
            if ( value > 1 ) {
                value = 1;
            } else if ( value < 0 ) {
                value = 0;
            }
            onlinePlayerInstance.volume = value;
            playlistPlayerInstance.volume = value;
            savePlayerVolume ( onlinePlayerInstance.volume );
        } catch ( error ) {
            console.log ( 'Warning: Volume must be from 0 to 1. For example 0.1' );
        }
    }
}

// init player volume
function initPlayerVolume () {
    var result = playerVolume;
    if ( localStorage.onlinePlayerVolume ) {
        result = localStorage.onlinePlayerVolume;
        setPlayerVolume ( result );
    }
    return result;
}

// save player volume
function savePlayerVolume ( value ) {
    localStorage.onlinePlayerVolume = value;
}

// toggle play icon
function toggleAppPlayIcon(showPlayIcon) {
    var iconPath = 'images/icon/icon_48.png';
    if(showPlayIcon) {
        iconPath = 'images/icon/icon_48_play.png';
    }
    if(currentAppIcon != iconPath) {
        currentAppIcon = iconPath;
        iconAnimation.flipHorizontalChange(iconPath);
    }
}

// play online player
function playPlayer ( playerInstance ) {
    if ( playerInstance ) {
        if(playerInstance == onlinePlayerInstance) {
            playerInstance.src = '';
            playerInstance.src = 'http://icecast.luxnet.ua/radio24_mp3';
        }
        playerInstance.play ();
        toggleAppPlayIcon(true);
    }
}

// pause online player
function pausePlayer ( playerInstance ) {
    if ( playerInstance ) {
        playerInstance.pause ();
        toggleAppPlayIcon(false);
    }
}

// check online player state
function isPlayerPlaying ( playerInstance ) {
    var result = false;
    if ( playerInstance ) {
        result = !playerInstance.paused;
    }
    return result;
}

/*** Online player player ***/

var onlinePlayerId = "online-player";
var onlinePlayerInstance = null;

// online player error handler popup
function onlinePlayerErrorBackground() {
    pausePlayer(onlinePlayerInstance);
}

/*** Playlist player ***/

var playlistPlayerId = "playlist-player";
var playlistPlayerInstance = null;
var currentPlaylistPlayIndex = -1;
var currentPlaySongIndex = 0;

// playlist song end handler background
function onPlaylistPlayerSongEndBackground () {
    //play next song
    if ( songsPlayData.list.length ) {
        currentPlaySongIndex++;
        if ( currentPlaySongIndex == songsPlayData.list.length ) {
            currentPlaySongIndex = 0;
        }
        if ( songsData.update != songsPlayData.update ) {
            currentPlaySongIndex = 0;
        }
        if ( currentPlaySongIndex < songsPlayData.list.length ) {
            if(isPlayerPlaying(onlinePlayerInstance)) {
                pausePlayer ( onlinePlayerInstance );
            }
            playlistPlayerPlay ( currentPlaySongIndex );
        }
    }
}

// on playlist player song end
function setPlaylistPlayerEndBackground () {
    playlistPlayerInstance.onended = onPlaylistPlayerSongEndBackground;
}

// online player error handler popup
function playlistPlayerErrorBackground() {
    pausePlayer (playlistPlayerInstance);
}

/*** Init players ***/

$ ( function () {
    // init online player
    onlinePlayerInstance = getPlayer ( onlinePlayerId );
    // init online player connection problem
    onlinePlayerInstance.onerror = onlinePlayerErrorBackground;
    onlinePlayerInstance.onstalled = onlinePlayerErrorBackground;
    //init playlist player
    playlistPlayerInstance = getPlayer ( playlistPlayerId );
    // init playlist player connection problem
    playlistPlayerInstance.onerror = playlistPlayerErrorBackground;
    playlistPlayerInstance.onstalled = playlistPlayerErrorBackground;
    // init common player
    initPlayerVolume ();
    // set playlist player song end
    setPlaylistPlayerEndBackground ();
} );