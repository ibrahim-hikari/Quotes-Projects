`use strict`;

let video = [
    { "vid": "support/1.mp4", "color": "rgb(85, 36, 141)" },
    { "vid": "support/2.mp4", "color": "rgb(36, 102, 141)" },
    { "vid": "support/3.mp4", "color": "rgb(79, 115, 136)" },
    { "vid": "support/4.mp4", "color": "rgb(7, 58, 87)" },
    { "vid": "support/5.mp4", "color": "rgb(98, 121, 151)" },
    { "vid": "support/6.mp4", "color": "rgb(179, 68, 92)" },
    { "vid": "support/7.mp4", "color": "rgb(90, 52, 52)" }
]

$(document).ready(function () {
    let rand = Math.floor(Math.random() * video.length)
    $('#vid').html(`<source id="test" src="${video[rand].vid}" type="video/mp4">`);
    $('#info').css('background-color', video[rand].color);
    $('header h1').css('color', video[rand].color);
    $('#quote').css("color", video[rand].color);

    $.getJSON(`data/quotes.json`, function (data) {
        let idxQuote = Math.floor(Math.random() * data.length)
        if (data[idxQuote].author == null) {
            $('#quote').html(`<p>"${data[idxQuote].text}"</p>\n<h3>Unknown</h3>`);
        } else {
            $('#quote').html(`<p>"${data[idxQuote].text}"</p>\n<h3>${data[idxQuote].author}</h3>`);
        }
    })
});