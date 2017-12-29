'use strict';

var isMetadataPage = location.href.toLowerCase().indexOf('metadata') > -1;
var scripts = [
  'https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.0.1/color-thief.min.js'
];

var hrefs = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css'
];

clearConsole()
  .then(() => Promise.all(getStylesheetLoadPromises(hrefs)))
  .then(() => Promise.all(getScriptLoadPromises(scripts)))
  .then(() => injectCssPromise())
  .then(() => getPosterUrlPromise())
  .then((posterUrl) => addTitleLinkPromise(posterUrl))
  .then(() => addRibbonPromise())
  .then(() => addColorPalettePromise())
  //.then(() => screenshotPromise())
  ;

function clearConsole() {
  return new Promise((resolve) => {
    try {
      console.clear();
    }
    catch (ex) {}

    return resolve();
  });
}

function injectIFramePromise(src) {
  return new Promise((resolve) => {
    var ifm = document.createElement('iframe');
    document.getElementsByTagName('body')[0].appendChild(ifm);


    ifm.onload = () => resolve();
    ifm.className = 'bhts';
    ifm.src = src;
  });
}

function injectCssPromise() {
  return new Promise((resolve) => {
    if (!isMetadataPage) {
      return resolve();
    }

    var style = `
      <style id='css-wrapper'>
        .bhts {
          display: block;
          position: absolute;
          z-index: 1000;
          width: 450px;
          height: 675px;
          margin: 0;
          padding: 0;
          top: 0;
          left: 0;
         ;
        }
        .bhts .img {
          height: 100%;
          width: 100%;
        }
      </style>
    `;

    $('head').append(style);
    $('body').addClass('focus');

    return resolve();
  });
}

function getPosterUrlPromise() {
  return new Promise((resolve) => {
    if (!isMetadataPage) {
      return resolve();
    }

    var $poster = $($('[class^="PosterCardImg-imageContainer"]:eq(0) > div:eq(0)')[0]);
    var reg = /^url\("(.+)"\)$/gi;
    var url = reg.exec($poster.css('backgroundImage'))[1];

    return resolve(url);
  });
}

function addTitleLinkPromise(url) {
  return new Promise((resolve) => {
    if (!isMetadataPage) {
      return resolve();
    }

    var $title = $('[class^="PrePlayLeftTitle-leftTitle-"]:eq(0)');
    var txt = $title.text();

    $title
      .html('<a href="' + url + '" target="' + txt + '">' + txt + '</a>')
      .css({
        'transition': 'all 1s ease'
      })
      .css({
        'border-radius': '2px',
        'background-color': 'orange',
        'color': '#fff',
        'padding': '0px 5px'
      })
      ;

    return resolve();
  });
}

function addColorPalettePromise() {
  return new Promise((resolve) => {
    if (isMetadataPage) {
      return resolve();
    }

    const palette = (new ColorThief())
      .getPalette($('img')[0])
      .map((a) => `rgb(${a[0]}, ${a[1]}, ${a[2]})`)

    palette.unshift('#fff', 'rgb(144, 144, 144)');

    const $ratings = $(`<div class="ratings" />`);
    $('body').append($ratings);
    $ratings.append(`<div id="swatch-0" class="swatches"></div>`);
    palette
      .forEach((c) => {
        const div = $(`<div class="circle" style="background-color: ${c};" />`);
        $('#swatch-0').append(div);

        div.on('click', toggleForeColor);
      });
    $('#swatch-0').append(`<div class="clearfix" />`);

    $ratings.append(`<div id="swatch-1" class="swatches"></div>`);
    palette
      .forEach((c) => {
        const div = $(`<div class="circle" style="background-color: ${c};" />`);
        $('#swatch-1').append(div);

        div.on('click', toggleBackgroundColor);
      });
    $('#swatch-1').append(`<div class="clearfix" />`);

    $('#swatch-0').find('.circle:eq(7)').trigger('click');
    $('#swatch-1').find('.circle:eq(0)').trigger('click');

    const divCheck = $(`<div class="check"><i class="fa fa-check fa-2x" style="margin-top: 4px; color: #fff;"></i></div>`)

    $ratings.append(divCheck);

    divCheck.on('click', takeScreenshot);

    // const $as = $(`<div class="stars stars-audio" />`)
    // const $vs = $(`<div class="stars stars-video" />`)

    // $ratings.append($as);
    // $ratings.append($vs);

    // $as.append(`<div class="star"><span><i class="fa fa-volume-up fa-2x"></i></span></div>`);
    // $vs.append(`<div class="star"><span><i class="fa fa-eye fa-2x"></i></span></div>`);

    // const $aRating = $('.star-rating.audio');
    // const $vRating = $('.star-rating.video');

    // const MAX_STARS = 10;
    // let counter = MAX_STARS + 0;

    // while(counter--) {
    //   $as.append(`<div class="star"><span><i class="fa fa-star-o fa-2x"></i></span></div>`);
    // }
    // $as.append(`<div class="clearfix" />`);

    // counter = MAX_STARS;

    // while(counter--) {
    //   $vs.append(`<div class="star"><span><i class="fa fa-star-o fa-2x"></i></span></div>`);
    // }
    // $vs.append(`<div class="clearfix" />`);

    function takeScreenshot() {
      $(this).hide();
      $('.swatches').hide();

      if ($('.star-rating').text().length === 0) {
        $('.star-rating-wrapper').hide();
      }

      screenshotPromise();
    }

    function toggleForeColor(el) {
      const $ribbon = $('#ribbon');
      const bgc = $(el.target).css('background-color');
      const $parent = $(el.target).parent();

      $parent.children().removeClass('selected');
      $(el.target).addClass('selected');

      $ribbon.css({
        'color': bgc
      });
    }

    function toggleBackgroundColor(el) {
      const $ribbon = $('#ribbon');
      const bgc = $(el.target).css('background-color');
      const $parent = $(el.target).parent();

      $parent.children().removeClass('selected');
      $(el.target).addClass('selected');

      $ribbon.css({
        'background-color': bgc
      });
    }

    return resolve();
  });
}

function addRibbonPromise() {
  if (isMetadataPage) {
    return;
  }

  var $wrapper;
  var $img = $('img');
  var $ribbon = $('<div id="ribbon" class="ribbon">Screener</div>');

  $('body').append('<div class="poster-wrapper"/>');
  $wrapper = $('.poster-wrapper');

  $img.appendTo($wrapper);

  $wrapper.append($ribbon);

  const $starRatingWrapper = $(`<div class="star-rating-wrapper" />`);
  $wrapper.append($starRatingWrapper)

  $starRatingWrapper.append(`<div id="star-rating" class="star-rating"><span>A10 V10</span></div>`);

  return addStylePromise();

  function addStylePromise() {
    return new Promise((resolve) => {
      if (isMetadataPage) {
        return resolve();
      }

      document.getElementById('ribbon').contentEditable = true;
      document.getElementById('star-rating').contentEditable = true;

      var style = `
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 900px !important;
          height: 675px !important;
          position: absolute;
          background-color: #fff !important;
        }
        .poster-wrapper {
          position: absolute;
          left: 0;
          top: 0;
          width: 450px;
          height: 675px;
        }
        img { width: 100%; height: 100% }
        .ratings {
          position: absolute;
          width: 450px;
          height: 675px;
          top: 0;
          left: 450px;
          background-color: #efefef;
        }
        .stars {
          width: 100%;
          padding-top: 20px;
          padding-left: 5px;
        }
        .star {
          float: left;
          width: 40px;
          text-align: center;
        }
        .star-rating-wrapper {
          position: absolute;
          bottom: 0;
          right: 0;
        }
        .star-rating-wrapper:after {
          visibility: hidden;
          display: block;
          font-size: 0;
          content: " ";
          clear: both;
          height: 0;
        }
        .star-rating {
          text-align: center;
          border-radius: 5px 0 0 5px;
          background-color: #eee;
          border: 1px solid #a0a0a0;
          border-right: none;
          float: left;
          line-height: 50px;
          font-size: 40px;
          font-family: sans-serif;
          padding: 0 10px;
          margin: 0 0 10px;
        }
        .star-rating > i,span {
          float: left;
        }
        .ribbon {
          position: absolute;
          top: 0;
          right: 0px;
          background-color: rgb(144, 144, 144);
          box-shadow: 0 0 5px #555;
          padding: 0;
          width: 301px;
          text-align: center;
          line-height: 2.2em;
          transform: rotate(45deg) translateX(30%) translateY(-15%);
          text-transform: uppercase;
          color: #fff;
          font-weight: bold;
          font-size: 1.5em;
          font-family: sans-serif;
        }
        a.poster {
          float: left;
          display: table;
          box-shadow: 3px 3px 10px #000;
          margin-bottom: 10px;
          cursor: pointer;
        }
        #notifier {
          float: left;
          height: 675px;
          position: relative;
        }
        #notifier .message {
          position: absolute;
          width: 250px;
          margin-left: 1000px;
          transition: all 2s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .in-place {
          margin-top: 50px;
          margin-left: 20px!important;
        }
        .circle {
          float: left;
          height: 30px;
          width: 30px;
          border-radius: 15px;
          margin: 5px;
          cursor: pointer;
          text-align: center;
          line-height: 40px;
          box-shadow: 0 0 3px #444;
        }
        .circle.selected {
          box-shadow: 0 0 1px 5px #000
        }
        .clearfix:after {
          visibility: hidden;
          display: block;
          font-size: 0;
          content: " ";
          clear: both;
          height: 0;
        }
        .swatches {
          margin: 7px 5px;
        }
        .check {
          position: absolute;
          bottom: 15px;
          right: 15px;
          line-height: 40px;
          height: 40px;
          width: 40px;
          text-align: center;
          border-radius: 20px;
          background-color: green;
          border: 1px solid #fff;
          cursor: pointer;
        }
      </style>`;

      $('head').append(style);

      return resolve();
    });
  }
}

function screenshotPromise() {
  return new Promise((resolve) => {
    if (isMetadataPage) {
      return resolve();
    }

    html2CanvasOnLoad();

    return resolve();
  });

  function addDownloadLinkToCanvas() {
    var link = document.createElement('a');
    var movieName;
    try{
      movieName = window.opener.document.getElementsByClassName('item-title')[0].innerText;
    }
    catch(e) {
      movieName = (new Date()).getTime();
    }
    link.id = 'download';
    link.addEventListener('click', function(ev) {
      link.href = $('canvas')[0].toDataURL();
      link.download = movieName + ".png";
    }, false);
    document.body.appendChild(link);
    $('a#download')
      .addClass('poster')
      .append($('canvas'));

    $('body').append('<div id="notifier"><div class="message"><-- Click on the image to download</div></div>');

    setTimeout(function(){
      $('.message').addClass('in-place');
    }, 100);
  }

  function html2CanvasOnLoad() {
    html2canvas(document.body, {
      onrendered: function(canvas) {
        $('body').html('');
        document.body.appendChild(canvas);
        addDownloadLinkToCanvas();
      },
      width: 450,
      height: 675
    });
  }
}

function getScriptLoadPromises(scripts) {
  scripts = typeof scripts === 'string' ? [scripts] : scripts;

  return scripts.map(function(src) {
    return new Promise(function(resolve, reject) {
      const s = document.createElement('script');

      document.getElementsByTagName('head')[0].appendChild(s);

      s.onload = () => resolve();
      s.onerror = (err) => resolve();
      s.src = src;
    });
  });
}

function getStylesheetLoadPromises(hrefs) {
  hrefs = typeof hrefs === 'string' ? [hrefs] : hrefs;

  return hrefs.map(function(href) {
    return new Promise(function(resolve, reject) {
      const s = document.createElement('link');
      s.setAttribute('rel', 'stylesheet');

      document.getElementsByTagName('head')[0].appendChild(s);

      s.onload = () => resolve();
      s.onerror = (err) => resolve();
      s.href = href;
    });
  });
}
