var config = require('./config.js');
window.$ = window.jQuery = require('./jquery.js');

var noResultMessage = 'No Result found for the search. Please try again';

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

$(document).ready(function () {
    var query = getQueryParam();
    if (hasBanWords(query)) {
        manageRestrictedSearch();
    } else {
        search(query);
    }
});

function TextSearcher(config) {
    this.engine = config.engine;
    this.sites = config.sites;
}
TextSearcher.prototype.search = function (query) {
    var siteQuery = this.sites.reduce(function (memo, site) {
        return memo + ' OR site:' + site
    });
    query = query + 'site:' + siteQuery;
    $.getJSON(this.engine, {
                q: query,
                format: 'json'
            })
            .then(function (results) {
                this.render(results);
            }.bind(this));
};
TextSearcher.prototype.render = function (results) {
    renderTextComponent({container: '#text-result-stream'}, results.results);

    $('#text-loading').addClass('hidden');
    $('#text-result-left-nav').removeClass('hidden');
    $('#text-result-right-nav').removeClass('hidden');
};

function AppSearcher(config) {
    this.engine = config.engine;
    this.sites = config.sites;
}

AppSearcher.prototype.search = function (query) {
    var siteQuery = this.sites.reduce(function (memo, site) {
        return memo + ' OR site:' + site
    });
    query = query + 'site:' + siteQuery;
    $.getJSON(this.engine, {
                q: query,
                format: 'json'
            })
            .then(function (results) {
                this.render(results);
            }.bind(this));
};

function parseAppSearchResult(results) {
    var filteredResults = results.results.filter(function (res) {
        var regex = /phet\.colorado\.edu\/sims\/html\/([a-z-]+)\/latest\/([a-z-]+)_en.html$/;
        var regexResult = regex.exec(res.url);
        if (regexResult) {
            res.url = "http://phet.colorado.edu/sims/html/" + regexResult[1] + "/latest/" + regexResult[1] + "_en.html";
            res.image = "http://phet.colorado.edu/sims/html/" + regexResult[1] + "/latest/" + regexResult[1] + "-600.png";
        }
        return regexResult;

    });
    return filteredResults;
}
AppSearcher.prototype.render = function (results) {

    renderAppComponent({container:'#application-result-stream'},parseAppSearchResult(results));

    $('#application-loading').addClass('hidden');
    $('#application-result-left-nav').removeClass('hidden');
    $('#application-result-right-nav').removeClass('hidden');
};

function VideoSearcher(config) {
    this.engine = config.engine;
    this.channels = config.channels;
    this.key = config.key;
    this.safeSearch = 'strict';
    this.part = 'snippet';
}
VideoSearcher.prototype.search = function (query) {
    var that = this;
    this.channels.forEach(function (channel) {
        $.getJSON(that.engine, {
            part: that.part,
            channelId: channel,
            q: query,
            safeSearch: that.safeSearch,
            key: that.key,
            format: 'json'
        }).then(function (res) {
            that.render(res);
        });
    });

};
VideoSearcher.prototype.render = function (results) {
    renderVideoComponent({container: '#video-result-stream'}, results.items);

    $('#video-loading').addClass('hidden');
    $('#video-result-left-nav').removeClass('hidden');
    $('#video-result-right-nav').removeClass('hidden');
};

function SummarySearcher(config) {
    this.engine = config.engine;
}
SummarySearcher.prototype.search = function (query) {
    $.ajax({
                url: this.engine,
                data: {q: query, format: 'json'},
                dataType: 'json',
                beforeSend: function (xhr, settings) {
                    settings.url = settings.url.replace(/%2B/g, '%20')
                }
            })
            .then(this.render.bind(this));
};
SummarySearcher.prototype.render = function (result) {
    if (result.AbstractText) {
        var container = $('#instant-answer');
        container.find('.instant-answer__description')
                .text(result.AbstractText);
        container.find('.instant-answer__image img')
                .attr('src', result.Image);
        container.find('.instant-answer__readmore')
                .attr('href', result.AbstractURL).data('url', result.AbstractURL);
        container.removeClass('hidden');
    }
};

var search = function (query) {
    var searchers = [

        new SummarySearcher(config.summary),
        new TextSearcher(config.text),
        new VideoSearcher(config.videos),
        new AppSearcher(config.apps)
    ];
    searchers.forEach(function (searcher, renderer) {
        searcher.search(query);
    });
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
    $('#application-result-container').addClass('hidden');
};


// Don't follow links, but show them in layout.html
$(document).on('click', '.instant-answer__readmore, .result-header', function (e) {
    e.preventDefault();
    window.location = "layout.html?q=" + $(this).data('url');
});


// Scrolling
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

function createResultStream(blocks) {
    if(blocks.length == 0) return "";
    return blocks.reduce(function (memo, block) {
        return memo + block;
    });
}

function createBlock(title, content, url) {
    return "<div class='result-block'><a class='result-link' href='layout.html?src=" + url + "'>" + title + content + "</a></div>";
}

function createBlockVideo(title, content, videoId) {
    return "<a class='result-link video-link' data-id='" + videoId + "' href='#'>" + title + content + "</a>";
}

function createTitleText(title) {
    return "<span class='result-title'>" + title + "</span>";
}

function createTitleImage(src) {
    return "<img class = 'video-result-img' src='" + src + "'/>";
}

function createContent(content) {
    return "<span class='result-description'>" + content + "</span>";
}

function renderTextComponent(config, results) {
    $(config.container).html(createResultStream(results.map(function (result) {
        return createBlock(createTitleText(result.title), createContent(result.content), result.url);
    })));
}
function renderAppComponent(config, results) {
    $(config.container).html(createResultStream(results.map(function (result) {
        return createBlock(createTitleImage(result.image), createContent(result.title), result.url);
    })));
}

function renderVideoComponent(config, results) {
    $(config.container).append(createResultStream(results.map(function (result) {
        return createBlockVideo(createTitleImage(result.snippet.thumbnails.medium.url), createContent(result.snippet.title), result.id.videoId);
    })));
}
