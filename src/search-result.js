window.$ = window.jQuery = require('./jquery.js');

// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Replace the 'ytplayer' element with an <iframe> and
// YouTube player after the API code downloads.
var player;

function onYouTubePlayerAPIReady() {
    player = new YT.Player('video-player', {
        height: '600',
        width: '800'
    });
}

var checkForBanWord = function (query) {
    return query.split("+").filter(function(chunk) {
            return banlist.hasOwnProperty(chunk.toLowerCase())
        }).length>0;
};

var manageRestrictedSearch = function () {
    displaySearchResultMessage("No Result found for the search. Please try again");
};

var displaySearchResultMessage=function(message){
    var container = $('#instant-answer');
    container.find('.instant-answer__description').text(message);
    container.removeClass('hidden')
        .addClass('restricted-search')
        .find('.instant-answer__readmore')
        .addClass('hidden');
    $('#text-result-container').addClass('hidden');
    $('#video-result-container').addClass('hidden');
}

$(document).ready(function () {
    var query = window.location.search.substring(1).split('&')[0].split('=')[1];
    if(checkForBanWord(query)){
        manageRestrictedSearch();
        return;
    }
    getInstantAnswer(query);
    search(query);
    videoSearch(query);
});

function getInstantAnswer(query) {
    $.ajax({
                url: 'http://api.duckduckgo.com',
                data: {q: query, format: 'json'},
                dataType: 'json',
                beforeSend: function (xhr, settings) {
                    settings.url = settings.url.replace(/%2B/g, '%20')
                }
            })
            .then(function (res) {
                if (res.AbstractText) {
                    var container = $('#instant-answer');
                    container.find('.instant-answer__description').text(res.AbstractText);
                    container.find('.instant-answer__image img').attr('src', res.Image);
                    container.find('.instant-answer__readmore').attr('href', res.AbstractURL).data('url', res.AbstractURL);
                    container.removeClass('hidden');
                }
            });
}

function searchForMedium(query, medium, done) {
    var siteQuery='';
    var count=1;
    medium.sites.forEach(function(site){
        siteQuery+='site:'+site + (count==medium.sites.length?'':' OR ');
        count++;
    });
    $.getJSON('http://searx.in', {
        q: query  +' '+ siteQuery,
        format: 'json',
    }).then(function (res) {
        done(res);
    });
}

function searchYouTube(query, channel, done) {
    $.getJSON('https://www.googleapis.com/youtube/v3/search', {
        part: "snippet",
        channelId: channel,
        q: query,
        safeSearch: "strict",
        key: "AIzaSyBQuBZQy0X_0g-D5bH5MC8Rg2bocnoLolI",
    }).then(function (res) {
        done(res);
    });
}

var media = [{
    type: 'text',
    sites: ['en.wikipedia.org', 'open.ac.uk', 'oercommons.org','ck12.org', 'howstuffworks.com']
  }];
var videoChannel = [
    "UCT7EcU7rC44DiS3RkfZzZMg", // AravindGupta
    "UC4a-Gbdw7vOaccHmFo40b9g", // KhanAcademy
    "UCT0s92hGjqLX6p7qY9BBrSA", // NCERT
    "UCFe6jenM1Bc54qtBsIJGRZQ" // PatrickMT
    ];

function mediaKey(site2find) {
    return media.filter(function (medium) {
        return medium.sites.indexOf(site2find) !== -1;
    })[0].type;
}

var renderTextElement = function (res) {
    var textElement = "<div class='result-block'>" +
            "<a class='result-link' href='layout.html?src=" + res.url + "'>" +
            "<span class='result-title'>"+res.title+"</span>"+
            "<span class='result-description'>" + res.content + "</span>" +
            "</a>" +
            "</div>";
    $('#text-result-stream').append(textElement);
};


var renderVideoElement = function (res) {
    var videoElement = "<div class='result-block'>" +
            "<a class='result-link video-link' data-id='" + res.id.videoId + "' href='#'>" +
            "<img class = 'video-result-img'src='"+res.snippet.thumbnails.medium.url+"'/>" +
            "<span class='result-description video-result-description'>" + res.snippet.title + "</span>" +
            "</a>" +
            "</div>";
    $('#video-result-stream').append(videoElement);
};

$(document).on('click', '.video-link', function(e) {
    e.preventDefault();
    showVideo($(this).data('id'));
});

function renderTextResult(results) {

    results.results.forEach(function (res) {
        renderTextElement(res);
    });
    $('#text-loading').addClass('hidden');
}

function renderVideoResult(results) {

    results.items.forEach(function (res) {
        renderVideoElement(res);
    });
    $('#video-loading').addClass('hidden');
}


function renderResult(results) {

    var resultSites = results.query.split(':');
    var resultSite = resultSites[resultSites.length-1];
    var resultType = mediaKey(resultSite);

    switch (resultType) {
        case 'text':
            renderTextResult(results);
            break;
        case 'videos':
            renderVideoResult(results);
            break;
    }
}

function search(query) {
    media.forEach(function (medium) {
        searchForMedium(query, medium, function (res) {
            renderResult(res);
        })
    });
}

function videoSearch(query) {
    videoChannel.forEach(function (channel) {
        searchYouTube(query, channel, function (res) {
            renderVideoResult(res);
        });
    });
}

$(document).on('click', '.instant-answer__readmore, .result-header', function (e) {
    e.preventDefault();
    window.location = "layout.html?q=" + $(this).data('url');
});

$(document).on('click', '.result-stream-nav__right', function (e) {
    e.preventDefault();
    scrollStream($(this).siblings('.result-stream'), 'right');
});
$(document).on('click', '.result-stream-nav__left', function (e) {
    e.preventDefault();
    scrollStream($(this).siblings('.result-stream'), 'left');
});

function scrollStream(resultStream, direction) {
    var totalWidth = resultStream.get(0).scrollWidth;
    var boxWidth = 270;
    var actualWidth = resultStream.width();

    var visibleNumberOfBoxes = Math.floor(actualWidth / boxWidth);
    var numberOfBoxesAlreadyScrolled = Math.floor(resultStream.scrollLeft() / boxWidth);

    var numberOfBoxesToScroll = ((direction == 'left') ? -1 : 1) * visibleNumberOfBoxes;

    var scrollWidth = (numberOfBoxesAlreadyScrolled + numberOfBoxesToScroll) * boxWidth;

    resultStream.animate({scrollLeft: scrollWidth}, 1000);

    var leftNav = resultStream.siblings('.result-stream-nav__left');
    if (scrollWidth <= 10) {
        leftNav.hide();
    } else {
        leftNav.show();
    }
    var rightNav = resultStream.siblings('.result-stream-nav__right');
    if (totalWidth - scrollWidth - actualWidth <= 10 /* buffer */) {
        rightNav.hide();
    } else {
        rightNav.show();
    }
}
function showVideo(videoId) {
    player.loadVideoById({videoId:videoId});
    showModal();
}
function showModal() {
    $('#modal-backdrop').show();
}
$(function() {
    $('#modal-backdrop').click(function(e){
        player.stopVideo();
        hideModal();
    });
    $('#modal').click(function(e){
     e.stopPropagation();
     });
    function hideModal() {
        $('#modal-backdrop').fadeOut();
    }
});
