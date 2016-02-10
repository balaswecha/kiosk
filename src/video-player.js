$(function () {
    $('#modal-backdrop').click(function (e) {
        hideVideoPlayer();
    });
    $('#modal').click(function (e) {
        e.stopPropagation();
    });
});
$(document).on('click', '.video-link', function (e) {
    e.preventDefault();
    showVideoPlayer($(this).data('id'));
});

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('video-player', {
        height: '600',
        width: '800',
        playerVars: {
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0
        }
    });
    player.addEventListener('onStateChange', 'playerStateHandler');
}

function playerStateHandler(event) {
    if (event.data == 0) {
        setTimeout(function () {
            hideVideoPlayer()
        }, 400);
    }
}

function showVideoPlayer(videoId) {
    player.loadVideoById({videoId: videoId, iv_load_policy: 3});
    showModal();
}

function hideVideoPlayer() {
    player.stopVideo();
    hideModal();
}

function showModal() {
    $('#modal-backdrop').show();
    $('iframe').contents().find('.ytp-watermark').remove();
}

function hideModal() {
    $('#modal-backdrop').fadeOut();
}
