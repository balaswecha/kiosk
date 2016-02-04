window.$ = window.jQuery = require('./jquery.js');

$(document).ready(function () {
    var query = window.location.search.substring(1).split('&')[0].split('=')[1];
    search(query)
});


function searchWebsite(query, site, done) {
    $.getJSON('https://searx.me/', {q: query + ' site:' + site, format: 'json'}).then(function (res) {
        done(res);
    });
}


var media = [{type:'text',sites: ['en.wikipedia.org']},{type:'video', sites: ['khanacademy.org']}];

function mediaKey(site2find){
    return media.filter(function(medium) {
        return medium.sites.indexOf(site2find) !== -1;
    })[0].type;
}

var renderTextElement = function (res) {
    var textElement ="<div class='text-result-block'>"+
            "<a href='"+res.url+"'>"+
            "<img class = 'text-result-img' src=''/>"+
            "<span class='text-result-description'>"+res.content+"</span>"+
            "</a>"+
    "</div>";
    $('#text-result-stream').append(textElement);
};


var renderVideoElement = function (res) {
    var textElement ="<div class='video-result-block'>"+
            "<a href='"+res.url+"'>"+
            "<img class = 'video-result-img'src='"+"a"+"'/>"+
            "<span class='video-result-description'>"+res.content+"</span>"+
            "</a>"+
    "</div>";
    $('#video-result-stream').append(textElement);
};

function renderTextResult(results) {

    results.results.forEach(function (res) {
        renderTextElement(res);
    });
}

function renderVideoResult(results) {

    results.results.forEach(function (res) {
        renderVideoElement(res);
    });
}


function renderResult(results) {

    var resultSite = results.query.split(':')[1];
    console.log(resultSite);
    var resultType = mediaKey(resultSite);
    console.log(resultType);

    switch(resultType){
        case 'text':
            renderTextResult(results);
            break;
        case 'video':
            renderVideoResult(results);
            break;
    }
}

function search(query) {
    media.forEach(function (medium) {
        medium.sites.forEach(function(site){
           searchWebsite(query,site,function(res){
               renderResult(res);
           })
        });
    });
}

$(document).on('click', '.result-header', function (e) {
    e.preventDefault();
    window.location = "layout.html?q=" + $(this).data('url');

});