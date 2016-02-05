window.$ = window.jQuery = require('./jquery.js');

$(document).ready(function () {
    var query = window.location.search.substring(1).split('&')[0].split('=')[1];
    getInstantAnswer(query);
    search(query);
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

function searchWebsite(query, site, done) {
    $.getJSON('https://searx.me/', {
        q: query + ' site:' + site,
        format: 'json',
        category: mediaKey(site)
    }).then(function (res) {
        done(res);
    });
}


var media = [{type: 'text', sites: ['en.wikipedia.org']}, {type: 'videos', sites: ['khanacademy.org']}];

function mediaKey(site2find) {
    return media.filter(function (medium) {
        return medium.sites.indexOf(site2find) !== -1;
    })[0].type;
}

var renderTextElement = function (res) {
    var textElement = "<div class='result-block'>" +
            "<a class='result-link' href='layout.html?q=" + res.url + "'>" +
            "<span class='result-title'>"+res.title+"</span>"+
            "<span class='result-description'>" + res.content + "</span>" +
            "</a>" +
            "</div>";
    $('#text-result-stream').append(textElement);
};


var renderVideoElement = function (res) {
    var textElement = "<div class='result-block'>" +
            "<a class='result-link' href='layout.html?q=" + res.url + "'>" +
            "<img class = 'video-result-img'src=''/>" +
            "<span class='result-description'>" + res.title + "</span>" +
            "</a>" +
            "</div>";
    $('#video-result-stream').append(textElement);
};

function renderTextResult(results) {

    results.results.forEach(function (res) {
        renderTextElement(res);
    });
    $('#text-loading').addClass('hidden');
}

function renderVideoResult(results) {

    results.results.forEach(function (res) {
        renderVideoElement(res);
    });
    $('#video-loading').addClass('hidden');
}


function renderResult(results) {

    var resultSite = results.query.split(':')[1];
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
        medium.sites.forEach(function (site) {
            searchWebsite(query, site, function (res) {
                renderResult(res);
            })
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
    var boxWidth = 200;
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
