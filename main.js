let staticNoise = document.querySelector(".static-noise");
let smpte = document.querySelector(".smpte");
let channelName = document.querySelector(".channel-name");
let muteIcon = document.querySelector(".muteIcon");
let control = document.querySelector(".control");
let powerScreen = document.querySelector(".power-screen");
let info = document.querySelector(".info");
let guide = document.querySelector(".guide");
let videoIdElement = document.querySelector(".videoIdElement .text");
let volumeSteps = document.querySelector(".volume-steps .steps");
let volumeStepsContainer = document.querySelector(".volume-steps");
let player, playingNow, playingNowOrder, startAt, vids, volume;
let channelNumber = 1;
let volumeFadeoutTimer, channelNameFadeoutTimer, controllerFadeoutTimer;
let isMin = false, isMuted = true, isOn = true, showInfo = false, showGuide = false;

if (localStorage.getItem("storedChannelNumber") === null) {
    channelNumber = 1;
    localStorage.setItem("storedChannelNumber", 1);
} else {
    channelNumber = Number(localStorage.getItem("storedChannelNumber"));
}

if (localStorage.getItem("storedVolume") === null) {
    volume = 70;
    localStorage.setItem("storedVolume", 70);
} else {
    volume = Number(localStorage.getItem("storedVolume"));
}

control.addEventListener("mouseover", function () {
    control.style.opacity = 1;
    clearTimeout(controllerFadeoutTimer);
});

control.addEventListener("mouseleave", function () {
    if (isMin) {
        controllerFadeoutTimer = setTimeout(() => {
            control.style.opacity = 0;
        }, 3000);
    }
});

function resizePlayer() {
    let p = document.querySelector("#player");
    p.style.top = - window.innerHeight * 0.5 + "px";
    p.style.left = (window.innerWidth - Math.min(window.innerHeight * 1.777, window.innerWidth)) / 2 + "px";
    player.setSize(Math.min(window.innerHeight * 1.777, window.innerWidth), window.innerHeight * 2);
}

function getList() {
    vids = {};
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            r = JSON.parse(this.responseText);
            vids = r;
            playChannel(channelNumber, false);
        }
    };
    xhttp.open("GET", "list.json?t=" + Date.now());
    xhttp.send();
}

function playChannel(ch, s) {
    clearTimeout(channelNameFadeoutTimer);
    (ch < 10) ? channelName.textContent = "CH 0" + ch : channelName.textContent = "CH " + ch;
    control.style.display = "block";
    smpte.style.opacity = 0;
    if (sync(ch)) {
        player.loadVideoById(playingNow, startAt);
        player.setVolume(volume);
        player.setPlaybackRate(1);
    } else if (s) {
        getList();
    } else {
        smpte.style.opacity = 1;
    }
}

function sync(ch) {
    playingNow = 0;
    let t = Math.floor(Date.now() / 1000);
    for (let i in vids[ch]) {
        if (t >= vids[ch][i].playAt && t < vids[ch][i].playAt + vids[ch][i].duration) {
            playingNowOrder = i;
            playingNow = vids[ch][i].id;
            startAt = t - vids[ch][i].playAt;
            return true;
        }
    }
    return false;
}

var scriptUrl = 'https:\/\/www.youtube.com\/s\/player\/d2e656ee\/www-widgetapi.vflset\/www-widgetapi.js'; try { var ttPolicy = window.trustedTypes.createPolicy("youtube-widget-api", { createScriptURL: function (x) { return x } }); scriptUrl = ttPolicy.createScriptURL(scriptUrl) } catch (e) { } var YT; if (!window["YT"]) YT = { loading: 0, loaded: 0 }; var YTConfig; if (!window["YTConfig"]) YTConfig = { "host": "https://www.youtube.com" };
if (!YT.loading) {
    YT.loading = 1; (function () {
        var l = []; YT.ready = function (f) { if (YT.loaded) f(); else l.push(f) }; window.onYTReady = function () { YT.loaded = 1; var i = 0; for (; i < l.length; i++)try { l[i]() } catch (e) { } }; YT.setConfig = function (c) { var k; for (k in c) if (c.hasOwnProperty(k)) YTConfig[k] = c[k] }; var a = document.createElement("script"); a.type = "text/javascript"; a.id = "www-widgetapi-script"; a.src = scriptUrl; a.async = true; var c = document.currentScript; if (c) {
            var n = c.nonce || c.getAttribute("nonce"); if (n) a.setAttribute("nonce",
                n)
        } var b = document.getElementsByTagName("script")[0]; b.parentNode.insertBefore(a, b)
    })()
};

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: 400,
        width: 700,
        playerVars: {
            'playsinline': 1,
            'disablekb': 1,
            'enablejsapi': 1,
            'iv_load_policy': 3,
            'cc_load_policy': 0,
            'controls': 0,
            'rel': 0,
            'autoplay': 1,
            'mute': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onAutoplayBlocked': onAutoplayBlocked,
            'onError': onErrorOccured
        }
    });
    resizePlayer();
    window.addEventListener('resize', function (event) {
        resizePlayer();
    }, true);
}

function onErrorOccured(event) {
    console.error(event.data);
}

function onPlayerReady(event) {
    getList();
    control.style.display = "block";
    document.addEventListener('keydown', (e) => {
        console.log(e.key);
        if (e.key === "ArrowUp")
            switchChannel(1);
        else if (e.key === "ArrowDown")
            switchChannel(-1);
        else if (e.key === "+" || e.key === "="  || e.key === "ArrowRight")
            changeVolume(5);
        else if (e.key === "-" || e.key === "_" || e.key === "ArrowLeft")
            changeVolume(-5);
        else if (e.key === "m")
            toggleMute();
        else if (e.key === " ")
            toggleGuide();
        else if (e.key === "Shift")
            toggleControl();
        else if (e.key === "Enter")
            togglePower();
        else if (e.key === "i")
            toggleInfo();
    });
}

function onPlayerStateChange(event) {
    staticNoise.style.opacity = 1;

    if (event.data == -1) {
        videoIdElement.innerHTML = "UNSTARTED";
    } else if (event.data == 0) {
        videoIdElement.innerHTML = "ENDED";
        if (Object.keys(vids[channelNumber]).length == playingNowOrder) {
            getList();
        } else {
            playChannel(channelNumber, false);
        }
    } else if (event.data == 1) {
        // PLAYING
        let _startAt = startAt;
        let _playingNow = playingNow;
        let _playingNowOrder = playingNowOrder;
        if (sync(channelNumber)) {
            if (_playingNow == playingNow && _playingNowOrder == playingNowOrder) {
                if (Math.abs(_startAt - startAt) > 10) {
                    player.seekTo(startAt);
                }
            } else {
                player.loadVideoById(playingNow, startAt);
            }
        } else {
            getList();
        }
        channelNameFadeoutTimer = setTimeout(() => {
            channelName.style.opacity = 0;
        }, 3000);
        staticNoise.style.opacity = 0;
        videoIdElement.innerHTML = playingNow;
    } else if (event.data == 2) {
        videoIdElement.innerHTML = "PAUSED";
    } else if (event.data == 3) {
        videoIdElement.innerHTML = "BUFFERING";
    } else if (event.data == 5) {
        videoIdElement.innerHTML = "VIDEO CUED";
    }
}

function onAutoplayBlocked() {
    console.log("Autoplay blocked!");
}

function toggleMute() {
    if (isOn) {
        if (player.isMuted()) {
            player.unMute();
            isMuted = false;
            muteIcon.src = "icons/volume-2.svg";
            if (volume == 0) volume = 5;
            localStorage.setItem("storedVolume", volume);
            volumeSteps.innerHTML = "";
            for (let i = 0; i < volume; i += 5) {
                volumeSteps.innerHTML += '<div class="step"></div>';
            }
        } else {
            muteIcon.src = "icons/volume-x.svg";
            player.mute();
            isMuted = true;
            volumeSteps.innerHTML = "";
        }
    }
}

function switchChannel(a) {
    if (isOn) {
        player.stopVideo();
        channelNumber += a;
        if (channelNumber < 1) {
            channelNumber = Object.keys(vids).length;
        }
        if (channelNumber > Object.keys(vids).length) {
            channelNumber = 1;
        }
        localStorage.setItem("storedChannelNumber", channelNumber);
        channelName.style.opacity = 1;
        playChannel(channelNumber, true);
    }
}

function toggleControl() {
    clearTimeout(controllerFadeoutTimer);
    let min = document.querySelectorAll(".min");
    let minimizeImg = document.querySelector(".minimizeImg");
    if (isMin) {
        min.forEach(e => {
            e.style.display = "flex";
        });
        isMin = false;
        minimizeImg.src = "icons/minimize-2.svg";
    } else {
        min.forEach(e => {
            e.style.display = "none";
        });
        minimizeImg.src = "icons/maximize.svg";
        isMin = true;
    }
}


function togglePower() {
    if (isOn) {
        isOn = false;
        player.pauseVideo();
        powerScreen.style.display = "block";
    } else {
        isOn = true;
        powerScreen.style.display = "none";
        playChannel(channelNumber, true);
    }
}
function toggleInfo() {
    if (showInfo) {
        showInfo = false;
        info.style.display = "none";
    } else {
        showInfo = true;
        info.style.display = "flex";
    }
}

function toggleGuide() {
    if (showGuide) {
        showGuide = false;
        guide.style.display = "none";
    } else {
        showGuide = true;
        guide.style.display = "flex";
    }
}


function changeVolume(d) {
    if (isOn) {
        volumeStepsContainer.style.opacity = 1;
        clearTimeout(volumeFadeoutTimer);
        volume += d;
        if (volume > 0) {
            player.unMute();
            isMuted = false;
            muteIcon.src = "icons/volume-2.svg";
        }
        if (volume >= 100) {
            volume = 100;
        }
        if (volume <= 0) {
            volume = 0;
            muteIcon.src = "icons/volume-x.svg";
            player.mute();
            isMuted = true;
        }
        localStorage.setItem("storedVolume", volume);
        player.setVolume(volume);
        volumeSteps.innerHTML = "";
        for (let i = 0; i < volume; i += 5) {
            volumeSteps.innerHTML += '<div class="step"></div>';
        }
        volumeFadeoutTimer = setTimeout(() => {
            volumeStepsContainer.style.opacity = 0;
        }, 3000);
    }
}