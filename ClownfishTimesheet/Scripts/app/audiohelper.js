var musicFiles = ["explosion.mp3", "jump.mp3", "score.mp3", "highscore.mp3", "fail.mp3", "music.mp3"];

function arrayBufferToString(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};
function stringToArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};

function supportsWebAudio() {
    var opera = /Opera/i.test(navigator.userAgent);
    return window.AudioContext && !opera;
};

function PreloadMusicFiles() {
    if (supportsWebAudio() && musicFiles.length > 0) {
        for (var i = 0; i < localStorage.length; i++)
            if (localStorage.key(i).substring(0, 6) === "audio-")
                for (var j = 0; j < musicFiles.length; j++)
                    if ("audio-" + musicFiles[j] === localStorage.key(i)) {
                        musicFiles.splice(j, 1);
                        break;
                    }

        for (var k = 0; k < musicFiles.length; k++)
            PreloadMusicFile(musicFiles[k]);
    }
};

function PreloadMusicFile(name) {
    var path = "../media/audio/";

    var xhr = new XMLHttpRequest();
    xhr.open('GET', path + name, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        var buffstring = arrayBufferToString(this.response) ;
        localStorage.setItem("audio-" + name, buffstring);
    };
    xhr.send();
};



