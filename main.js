let staticNoise = document.querySelector(".static-noise");
let smpte = document.querySelector(".smpte");
let channelName = document.querySelector(".channel-name");
let muteIcon = document.querySelector(".muteIcon");
let control = document.querySelector(".control");
let controlT1 = document.querySelector(".control .t-1");
let controlT2 = document.querySelector(".control .t-2");
let powerScreen = document.querySelector(".power-screen");
let info = document.querySelector(".info");
let guide = document.querySelector(".guide");
let videoIdElement = document.querySelector(".videoIdElement .text");
let volumeSteps = document.querySelector(".volume-steps .steps");
let volumeStepsContainer = document.querySelector(".volume-steps");
let player, playingNow, playingNowOrder, startAt, vids, volume;
let channelNumber = 1;
let volumeFadeoutTimer, channelNameFadeoutTimer, controllerFadeoutTimer, numberInputTimer;
let isMin = false, isMuted = true, isOn = true, showInfo = false, showGuide = false, isControlSwipe = false;
let touchStartX, touchStartY, touchMoveX, touchMoveY, controlCurrPos = 0, distanceMoved, channelNumberInput = "", lastChannelNumber;

if (localStorage.getItem("storedChannelNumber") === null) {
    channelNumber = 1;
    localStorage.setItem("storedChannelNumber", channelNumber);
} else {
    channelNumber = Number(localStorage.getItem("storedChannelNumber"));
}

if (localStorage.getItem("storedLastChannelNumber") === null) {
    lastChannelNumber = channelNumber;
    localStorage.setItem("storedLastChannelNumber", lastChannelNumber);
} else {
    lastChannelNumber = Number(localStorage.getItem("storedLastChannelNumber"));
}

if (localStorage.getItem("storedVolume") === null) {
    volume = 70;
    localStorage.setItem("storedVolume", 70);
} else {
    volume = Number(localStorage.getItem("storedVolume"));
}

document.body.addEventListener("touchend", function () {
    control.style.opacity = 1;
    clearTimeout(controllerFadeoutTimer);
});

document.body.addEventListener("mousemove", function (e) {
    if (isMin) {
        control.style.opacity = 1;
        clearTimeout(controllerFadeoutTimer);
        controllerFadeoutTimer = setTimeout(() => {
            control.style.opacity = 0;
        }, 3000);
    }
    controlSwipeMove(e.clientX, e.clientY);
});

control.addEventListener("touchstart", (e) => {
    controlSwipeDown(e.touches[0].clientX, e.touches[0].clientY);
});

control.addEventListener("mousedown", (e) => {
    controlSwipeDown(e.clientX, e.clientY);
});

document.addEventListener("touchmove", (e) => {
    controlSwipeMove(e.touches[0].clientX, e.touches[0].clientY);
});

document.addEventListener("touchend", (e) => {
    controlSwipeEnd();
});

document.addEventListener("mouseup", (e) => {
    controlSwipeEnd();
});

function controlSwipeDown(x, y) {
    isControlSwipe = true;
    touchStartX = x;
    touchStartY = y;
}

function controlSwipeMove(x, y) {
    if (isControlSwipe) {
        touchMoveX = x;
        touchMoveY = y;
        distanceMoved = (touchMoveX - touchStartX);
        t = distanceMoved + controlCurrPos;
        if (t > 10) t = 10;
        if (t < - control.offsetWidth - 10) t = - control.offsetWidth - 10;
        controlT1.style.transform = "translateX(" + t + "px)";
        controlT2.style.transform = "translateX(" + t + "px)";
    }
}

function controlSwipeEnd(){
    if (distanceMoved > 20) controlCurrPos = 0;
    if (distanceMoved < -20) controlCurrPos = - control.offsetWidth;
    controlT1.style.transform = "translateX(" + controlCurrPos + "px)";
    controlT2.style.transform = "translateX(" + controlCurrPos + "px)";
    isControlSwipe = false;
}

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
    if (ch > 0 && ch < Object.keys(vids).length + 1) {
        if (localStorage.getItem("storedChannelNumber") != ch) {
            (ch < 10) ? channelName.textContent = "CH 0" + ch : channelName.textContent = "CH " + ch;
            channelName.style.opacity = 1;
            lastChannelNumber = channelNumber;
            channelNumber = ch;
            localStorage.setItem("storedLastChannelNumber", lastChannelNumber);
            localStorage.setItem("storedChannelNumber", ch);
        }
        control.style.display = "flex";
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
    } else {
        channelName.textContent = "INVALID";
        channelNameFadeoutTimer = setTimeout(() => {
            channelName.style.opacity = 0;
        }, 3000);
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
    control.style.display = "flex";
    if (localStorage.getItem("controlAnimate") === null) {
        controlT1.style.animation = "2s swipeControl";
        controlT2.style.animation = "2s swipeControl";
        localStorage.setItem("controlAnimate", "1");
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp")
            switchChannel(1);
        else if (e.key === "ArrowDown")
            switchChannel(-1);
        else if (e.key === "+" || e.key === "=" || e.key === "ArrowRight")
            changeVolume(5);
        else if (e.key === "-" || e.key === "_" || e.key === "ArrowLeft")
            changeVolume(-5);
        else if (e.key === "m" || e.key === "M")
            toggleMute();
        else if (e.key === " ")
            toggleGuide();
        else if (e.key === "Shift")
            toggleControl();
        else if (e.key === "Enter")
            goToChannel();
        else if (e.key === "i" || e.key === "I")
            toggleInfo();
        else if (e.key === "f" || e.key === "F")
            toggleFullScreen();
        else if (e.key === "0" || e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4" || e.key === "5" || e.key === "6" || e.key === "7" || e.key === "8" || e.key === "9")
            numberInput(e.key);
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
        let newChannelNumber = channelNumber + a;
        if (newChannelNumber < 1) {
            newChannelNumber = Object.keys(vids).length;
        }
        if (newChannelNumber > Object.keys(vids).length) {
            newChannelNumber = 1;
        }
        playChannel(Number(newChannelNumber), true);
    }
}

function toggleControl() {
    clearTimeout(controllerFadeoutTimer);
    let min = document.querySelectorAll(".min");
    let w = document.querySelectorAll(".control .w");
    let minimizeImg = document.querySelector(".minimizeImg");
    if (isMin) {
        min.forEach(e => { e.style.display = "flex"; });
        isMin = false;
        minimizeImg.src = "icons/minimize-2.svg";
        w.forEach(e => { e.style.margin = "0 0 0.5rem 0"; });
    } else {
        min.forEach(e => { e.style.display = "none"; });
        minimizeImg.src = "icons/maximize-2.svg";
        isMin = true;
        w.forEach(e => { e.style.margin = "0"; });
        controllerFadeoutTimer = setTimeout(() => {
            control.style.opacity = 0;
        }, 3000);
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

function toggleFullScreen() {
    let elem = document.body;
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        elem.requestFullscreen();
    }
}

document.body.addEventListener("fullscreenchange", fullScreenChanged);
function fullScreenChanged() {
    let fullScreenIcon = document.querySelector(".control .full-screen-icon");
    if (document.fullscreenElement) {
        fullScreenIcon.src = "icons/minimize.svg";
    } else {
        fullScreenIcon.src = "icons/maximize.svg";
    }

}

function numberInput(n) {
    if (isOn) {
        clearTimeout(numberInputTimer);
        clearTimeout(channelNameFadeoutTimer);
        channelNumberInput += n;
        channelName.textContent = channelNumberInput;
        channelName.style.opacity = 1;
        numberInputTimer = setTimeout(() => {
            playChannel(Number(channelNumberInput), true);
            channelNumberInput = "";
        }, 1800);
    }
}

function recallChannel() {
    if (isOn && lastChannelNumber != channelNumber) {
        playChannel(Number(lastChannelNumber), true);
    }
}

function goToChannel() {
    if (isOn) {
        clearTimeout(numberInputTimer);
        clearTimeout(channelNameFadeoutTimer);
        playChannel(Number(channelNumberInput), true);
        channelNumberInput = "";
    }
}