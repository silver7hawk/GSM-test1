/*
Title: MIT License

Copyright (c) 2009-2011 Chris Leonello

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


/**
 * jqPlot
 * Pure JavaScript plotting plugin using jQuery
 *
 * Version: 1.0.0b2_r1012
 *
 * Copyright (c) 2009-2011 Chris Leonello
 * jqPlot is currently available for use in all personal or commercial projects 
 * under both the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL 
 * version 2.0 (http://www.gnu.org/licenses/gpl-2.0.html) licenses. This means that you can 
 * choose the license that best suits your project and use it accordingly. 
 *
 * Although not required, the author would appreciate an email letting him 
 * know of any substantial use of jqPlot.  You can reach the author at: 
 * chris at jqplot dot com or see http://www.jqplot.com/info.php .
 *
 * If you are feeling kind and generous, consider supporting the project by
 * making a donation at: http://www.jqplot.com/donate.php .
 *
 * sprintf functions contained in jqplot.sprintf.js by Ash Searle:
 *
 *     version 2007.04.27
 *     author Ash Searle
 *     http://hexmen.com/blog/2007/03/printf-sprintf/
 *     http://hexmen.com/js/sprintf.js
 *     The author (Ash Searle) has placed this code in the public domain:
 *     "This code is unrestricted: you are free to use it however you like."
 * 
 */
(function ($) {
    /**
    * Class: $.jqplot.ForestRenderer
    * jqPlot Plugin to draw Open Hi Low Close, Candlestick and Hi Low Close charts.
    * 
    * To use this plugin, include the renderer js file in 
    * your source:
    * 
    * > <script type="text/javascript" src="plugins/jqplot.ForestRenderer.js"></script>
    * 
    * You will most likely want to use a date axis renderer
    * for the x axis also, so include the date axis render js file also:
    * 
    * > <script type="text/javascript" src="plugins/jqplot.dateAxisRenderer.js"></script>
    * 
    * Then you set the renderer in the series options on your plot:
    * 
    * > series: [{renderer:$.jqplot.ForestRenderer}]
    * 
    * For OHLC and candlestick charts, data should be specified
    * like so:
    * 
    * > dat = [['07/06/2009',138.7,139.68,135.18,135.4], ['06/29/2009',143.46,144.66,139.79,140.02], ...]
    * 
    * If the data array has only 4 values per point instead of 5,
    * the renderer will create a Hi Low Close chart instead.  In that case,
    * data should be supplied like:
    * 
    * > dat = [['07/06/2009',139.68,135.18,135.4], ['06/29/2009',144.66,139.79,140.02], ...]
    * 
    * To generate a candlestick chart instead of an OHLC chart,
    * set the "candlestick" option to true:
    * 
    * > series: [{renderer:$.jqplot.ForestRenderer, rendererOptions:{candleStick:true}}],
    * 
    */
    $.jqplot.ForestRenderer = function () {
        // subclass line renderer to make use of some of it's methods.
        $.jqplot.LineRenderer.call(this);
        // prop: candleStick
        // true to render chart as candleStick.
        // Must have an open price, cannot be a hlc chart.
        // this.candleStick = false;
        // prop: tickLength
        // length of the line in pixels indicating open and close price.
        // Default will auto calculate based on plot width and 
        // number of points displayed.
        this.tickLength = 'auto';
        // prop: bodyWidth
        // width of the candlestick body in pixels.  Default will auto calculate
        // based on plot width and number of candlesticks displayed.
        this.bodyWidth = 'auto';
        // prop: openColor
        // color of the open price tick mark.  Default is series color.
        this.openColor = null;
        // prop: closeColor
        // color of the close price tick mark.  Default is series color.
        this.closeColor = null;
        // prop: wickColor
        // color of the hi-lo line thorugh the candlestick body.
        // Default is the series color.
        this.wickColor = null;
        // prop: fillUpBody
        // true to render an "up" day (close price greater than open price)
        // with a filled candlestick body.
        this.fillUpBody = false;
        // prop: fillDownBody
        // true to render a "down" day (close price lower than open price)
        // with a filled candlestick body.
        this.fillDownBody = true;
        // prop: upBodyColor
        // Color of candlestick body of an "up" day.  Default is series color.
        this.upBodyColor = null;
        // prop: downBodyColor
        // Color of candlestick body on a "down" day.  Default is series color.
        this.downBodyColor = null;
        // prop: hlc
        // true if is a hi-low-close chart (no open price).
        // This is determined automatically from the series data.
        this.hlc = false;
        // prop: lineWidth
        // Width of the hi-low line and open/close ticks.
        // Must be set in the rendererOptions for the series.
        this.lineWidth = 1.5;

        this.firstX = null;
        this.lastX = null;

        this.referenceY = null;

        this._tickLength;
        this._bodyWidth;
    };

    $.jqplot.ForestRenderer.prototype = new $.jqplot.LineRenderer();
    $.jqplot.ForestRenderer.prototype.constructor = $.jqplot.ForestRenderer;

    // called with scope of series.
    $.jqplot.ForestRenderer.prototype.init = function (options) {
        options = options || {};
        // lineWidth has to be set on the series, changes in renderer
        // constructor have no effect.  set the default here
        // if no renderer option for lineWidth is specified.
        this.lineWidth = options.lineWidth || 1.5;

        $.jqplot.LineRenderer.prototype.init.call(this, options);
        //this._type = 'ohlc';
        // set the yaxis data bounds here to account for hi and low values
        var db = this._yaxis._dataBounds;
        var d = this._plotData;
        //        // if data points have less than 5 values, force a hlc chart.
        //        if (d[0].length < 5) {
        //            this.renderer.hlc = true;

        //            for (var j = 0; j < d.length; j++) {
        //                if (d[j][2] < db.min || db.min == null) {
        //                    db.min = d[j][2];
        //                }
        //                if (d[j][1] > db.max || db.max == null) {
        //                    db.max = d[j][1];
        //                }
        //            }
        //        }
        //        else {
        for (var j = 0; j < d.length; j++) {
            if (d[j][3] < db.min || db.min == null) {
                db.min = d[j][3];
            }
            if (d[j][2] > db.max || db.max == null) {
                db.max = d[j][2];
            }
        }
        //        }
        this.firstX = d[0][0];
        this.lastX = d[d.length - 1][0];
        this.referenceY = d[d.length - 1][1];
    };

    // called within scope of series.
    $.jqplot.ForestRenderer.prototype.draw = function (ctx, gd, options) {

        
        $.jqplot.LineRenderer.prototype.init.call(this, options);
        var db = this._yaxis._dataBounds;
        var d = this.data;
        for (var j = 0; j < d.length; j++) {
            if (d[j][3] < db.min || db.min == null) {
                db.min = d[j][3];
            }
            if (d[j][2] > db.max || db.max == null) {
                db.max = d[j][2];
            }
        }
        this.firstX = d[0][0];
        this.lastX = d[d.length - 1][0];
        this.referenceY = d[d.length - 1][1];

        //var d = this.data;
        var xmin = this._xaxis.min;
        var xmax = this._xaxis.max;
        // index of last value below range of plot.
        var xminidx = 0;
        // index of first value above range of plot.
        var xmaxidx = d.length;
        var xp = this._xaxis.series_u2p;
        var yp = this._yaxis.series_u2p;
        var i, prevColor, ops, b, h, w, a, points;
        var o;
        var r = this.renderer;
        var opts = (options != undefined) ? options : {};
        var shadow = (opts.shadow != undefined) ? opts.shadow : this.shadow;
        var fill = (opts.fill != undefined) ? opts.fill : this.fill;
        var fillAndStroke = (opts.fillAndStroke != undefined) ? opts.fillAndStroke : this.fillAndStroke;
        r.bodyWidth = (opts.bodyWidth != undefined) ? opts.bodyWidth : r.bodyWidth;
        r.tickLength = (opts.tickLength != undefined) ? opts.tickLength : r.tickLength;
        ctx.save();
        if (this.show) {
            var x;
            for (var i = 0; i < d.length; i++) {
                if (d[i][0] < xmin) {
                    xminidx = i;
                }
                else if (d[i][0] < xmax) {
                    xmaxidx = i + 1;
                }
            }

            var dwidth = this.gridData[xmaxidx - 1][0] - this.gridData[xminidx][0];
            var nvisiblePoints = xmaxidx - xminidx;
            try {
                var dinterval = Math.abs(this._xaxis.series_u2p(parseInt(this._xaxis._intervalStats[0].sortedIntervals[0].interval, 10)) - this._xaxis.series_u2p(0));
            }
            catch (e) {
                var dinterval = dwidth / nvisiblePoints;
            }


            if (typeof (r.tickLength) == 'number') {
                r._tickLength = r.tickLength;
            }
            else {
                r._tickLength = Math.min(10, dinterval / 3.5);
            }
            //r.shapeRenderer.draw(ctx, [[xp(d[xminidx][0]), yp(d[xmaxidx - 1][1])], [xp(d[xmaxidx - 1][0]), yp(d[xmaxidx - 1][1])]]);

            //draw vertical line
            o = {};
            for (var i = xminidx; i < xmaxidx; i++) {
                //draw vertical line
                x = xp(d[i][0]);
//                if (r.wickColor) {
//                    o.color = r.wickColor;
//                }
                ops = $.extend(true, {}, opts, o);
                r.shapeRenderer.draw(ctx, [[x, yp(d[i][1])], [x, yp(this.referenceY)]], ops);
            }
        }

        ctx.restore();
    };


    // called within scope of series.
    $.jqplot.ForestRenderer.prototype.drawSingleBar = function (ctx, gd, options) {


        $.jqplot.LineRenderer.prototype.init.call(this, options);
        var db = this._yaxis._dataBounds;
        var d = this.data;
        for (var j = 0; j < d.length; j++) {
            if (d[j][3] < db.min || db.min == null) {
                db.min = d[j][3];
            }
            if (d[j][2] > db.max || db.max == null) {
                db.max = d[j][2];
            }
        }
        this.firstX = d[0][0];
        this.lastX = d[d.length - 1][0];
        this.referenceY = d[d.length - 1][1];

        //var d = this.data;
        var xmin = this._xaxis.min;
        var xmax = this._xaxis.max;
        // index of last value below range of plot.
        var xminidx = 0;
        // index of first value above range of plot.
        var xmaxidx = d.length;
        var xp = this._xaxis.series_u2p;
        var yp = this._yaxis.series_u2p;
        var i, prevColor, ops, b, h, w, a, points;
        var o;
        var r = this.renderer;
        var opts = (options != undefined) ? options : {};
        var shadow = (opts.shadow != undefined) ? opts.shadow : this.shadow;
        var fill = (opts.fill != undefined) ? opts.fill : this.fill;
        var fillAndStroke = (opts.fillAndStroke != undefined) ? opts.fillAndStroke : this.fillAndStroke;
        r.bodyWidth = (opts.bodyWidth != undefined) ? opts.bodyWidth : r.bodyWidth;
        r.tickLength = (opts.tickLength != undefined) ? opts.tickLength : r.tickLength;
        ctx.save();
        if (this.show) {
            var x;
            for (var i = 0; i < d.length; i++) {
                if (d[i][0] < xmin) {
                    xminidx = i;
                }
                else if (d[i][0] < xmax) {
                    xmaxidx = i + 1;
                }
            }

            var dwidth = this.gridData[xmaxidx - 1][0] - this.gridData[xminidx][0];
            var nvisiblePoints = xmaxidx - xminidx;
            try {
                var dinterval = Math.abs(this._xaxis.series_u2p(parseInt(this._xaxis._intervalStats[0].sortedIntervals[0].interval, 10)) - this._xaxis.series_u2p(0));
            }
            catch (e) {
                var dinterval = dwidth / nvisiblePoints;
            }


            if (typeof (r.tickLength) == 'number') {
                r._tickLength = r.tickLength;
            }
            else {
                r._tickLength = Math.min(10, dinterval / 3.5);
            }
            //r.shapeRenderer.draw(ctx, [[xp(d[xminidx][0]), yp(d[xmaxidx - 1][1])], [xp(d[xmaxidx - 1][0]), yp(d[xmaxidx - 1][1])]]);

            //draw vertical line
            o = {};
            for (var i = xminidx; i < xmaxidx; i++) {
                //draw vertical line
                x = xp(d[i][0]);
                //                if (r.wickColor) {
                //                    o.color = r.wickColor;
                //                }
                ops = $.extend(true, {}, opts, o);
                r.shapeRenderer.draw(ctx, [[x, yp(d[i][1])], [x, yp(this.referenceY)]], ops);
            }
        }

        ctx.restore();
    };



    $.jqplot.ForestRenderer.prototype.drawShadow = function (ctx, gd, options) {
        // This is a no-op, shadows drawn with lines.
    };

    // called with scope of plot.
    $.jqplot.ForestRenderer.checkOptions = function (target, data, options) {
        // provide some sensible highlighter options by default
        // These aren't good for hlc, only for ohlc or candlestick
        if (!options.highlighter) {
            options.highlighter = {
                showMarker: false,
                tooltipAxes: 'y',
                yvalues: 4,
                formatString: '<table class="jqplot-highlighter"><tr><td>date:</td><td>%s</td></tr><tr><td>open:</td><td>%s</td></tr><tr><td>hi:</td><td>%s</td></tr><tr><td>low:</td><td>%s</td></tr><tr><td>close:</td><td>%s</td></tr></table>'
            };
        }
    };

    //$.jqplot.preInitHooks.push($.jqplot.ForestRenderer.checkOptions);

})(jQuery);    