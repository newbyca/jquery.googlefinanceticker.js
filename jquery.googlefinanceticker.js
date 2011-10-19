 /**
 * google finance ticker 1.0
 * jQuery plugin that converts a div into a stock ticker driven by live Google Finance data
 * roughly based on http://www.gcmingati.net/wordpress/wp-content/lab/jquery/newsticker/jq-liscroll/scrollanimate.html
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * Copyright 2012 Chris Newby
 */

jQuery.fn.googlefinanceticker = function (settings) {

    this.settings = jQuery.extend(
        {
            velocity: 0.10,
            tickers: 'goog,aapl,msft,csco,intc,ibm,att,bidu',
            refresh: 1000 * 60 * 15
        },
        this.settings
    );

    var $container = $(this);
    $container.addClass('googlefinanceticker');
    $container.html('<div class="mask"><div class="tickertape"></div><div class="left-blind"></div><div class="right-blind"></div></div>')
    var $scroll = $($container.children().eq(0).children().eq(0));

    this.initialize = function () {
        $container.width($container.width()); //hack: for when container div is using width = auto\100%
        $.extend($scroll, { settings: this.settings });
        $.extend($scroll, { resetScroll: this.resetScroll });
        this.loadFeed();
        setInterval(this.loadFeed, this.settings.refresh);
    }

    this.loadFeed = function () {
        var url = this.getFeedUrl();
        $.getJSON(url, function (data) {
            var html = '';
            $.each(data, function (i, tickerData) {
                html +=
                        '<a target="_blank" href="http://www.google.com/finance?q=' + tickerData.t + '">' + tickerData.name + '</a>'
                        + '<span>'
                        ;
                if (tickerData.l.toString().length > 0)
                    html += tickerData.l;
                if (tickerData.c.toString().length > 0)
                    html += '&nbsp;&nbsp;' + tickerData.c + '%';
                html += '</span>';
            });
            $scroll.html(html);
            $scroll.resetScroll();
        });
    }

    this.getFeedUrl = function () {
        var url =
            'http://www.google.com/finance/info?infotype=infoquoteall&q='
            + settings.tickers
            + '&callback=?'
            ;
        return url;
    }

    this.resetScroll = function () {

        var scrollWidth = 0;
        $scroll.children().each(function (i, c) {
            scrollWidth += $(c).outerWidth(true);
        });
        $scroll.width(scrollWidth);
        var containerWidth = $container.outerWidth(true);
        var distance = containerWidth + $scroll.outerWidth(true);
        var dt = distance / $scroll.settings.velocity;
        function scrollticker(d, t) {
            $scroll.animate(
                { left: '-=' + d }, t, 'linear',
                function () {
                    $scroll.css('left', containerWidth);
                    scrollticker(distance, dt);
                }
            );
        };
        $scroll.css('left', containerWidth);
        scrollticker(distance, dt);

        $scroll.hover(
            function () {
                jQuery(this).stop();
            }, function () {
                var distance = containerWidth - $scroll.position().left;
                var dt = distance / $scroll.settings.velocity;
                scrollticker(distance, dt);
            });

    }

    this.initialize();

}