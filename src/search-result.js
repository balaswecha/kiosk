window.$ = window.jQuery = require('./jquery.js');

var noResultMessage = 'No Result found for the search. Please try again';
var textSearchEngine = 'http://searx.in';


$(document).ready(function () {
    var query = getQueryParam();
    if (hasBanWords(query)) {
        manageRestrictedSearch();
    } else {
        search(query);
    }
});

var getQueryParam = function () {
    return window.location.search.substring(1).split('&')[0].split('=')[1];
};

var hasBanWords = function (query) {
    return query.split("+").filter(function (chunk) {
            return banlist.hasOwnProperty(chunk.toLowerCase())
        }).length > 0;
};

var manageRestrictedSearch = function () {
    displayResultMessage(noResultMessage);
};

var search = function (queryToSearch) {
    getSummary(queryToSearch);
    textSearch(queryToSearch);
    videoSearch(queryToSearch);
};

var displayResultMessage = function (message) {
    var container = $('#instant-answer');
    container.find('.instant-answer__description').text(message);
    container.removeClass('hidden')
        .addClass('restricted-search')
        .find('.instant-answer__readmore')
        .addClass('hidden');
    $('#text-result-container').addClass('hidden');
    $('#video-result-container').addClass('hidden');
};

function getSummary(query) {
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
                container
                    .find('.instant-answer__description')
                    .text(res.AbstractText);
                container
                    .find('.instant-answer__image img')
                    .attr('src', res.Image);
                container
                    .find('.instant-answer__readmore')
                    .attr('href', res.AbstractURL).data('url', res.AbstractURL);
                container
                    .removeClass('hidden');
            }
        });
}

var textSearch = function (query) {
    media.forEach(function (medium) {
        $.getJSON(textSearchEngine, getSearchQuery(medium, query))
            .then(function (searchResult) {
                renderResult(searchResult);
            });
    });
};

var videoSearch = function (query) {
    videoChannel.forEach(function (channel) {
        searchYouTube(query, channel, function (res) {
            renderVideoResult(res);
        });
    });
};

function getSitesToQuery(medium) {
    var siteQuery = '';
    var count = 1;
    medium.sites.forEach(function (site) {
        siteQuery += 'site:' + site
            + (count == medium.sites.length ? '' : ' OR ');
        count++;
    });
    return siteQuery;
}

function getSearchQuery(medium, query) {
    var siteToQuery = getSitesToQuery(medium);
    return {
        q: query + ' ' + siteToQuery,
        format: 'json'
    };
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
    sites: ['en.wikipedia.org', 'oercommons.org', 'ck12.org']
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
        "<span class='result-title'>" + res.title + "</span>" +
        "<span class='result-description'>" + res.content + "</span>" +
        "</a>" +
        "</div>";
    $('#text-result-stream').append(textElement);
};


var renderVideoElement = function (res) {
    var videoElement = "<div class='result-block'>" +
        "<a class='result-link video-link' data-id='" + res.id.videoId + "' href='#'>" +
        "<img class = 'video-result-img'src='" + res.snippet.thumbnails.medium.url + "'/>" +
        "<span class='result-description video-result-description'>" + res.snippet.title + "</span>" +
        "</a>" +
        "</div>";
    $('#video-result-stream').append(videoElement);
};

$(document).on('click', '.video-link', function (e) {
    e.preventDefault();
    showVideoPlayer($(this).data('id'));
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
    var resultSite = resultSites[resultSites.length - 1];
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
