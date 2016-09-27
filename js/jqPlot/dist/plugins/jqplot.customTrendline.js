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
    * Class: $.jqplot.Trendline
    * Plugin which will automatically compute and draw trendlines for plotted data.
    */
    $.jqplot.Trendline = function (opts) {
        // Group: Properties

        // prop: show
        // Wether or not to show the trend line.
        this.show = true;
        // prop: color
        // CSS color spec for the trend line.
        // By default this wil be the same color as the primary line.
        this.color = '#666666';
        // prop: renderer
        // Renderer to use to draw the trend line.
        // The data series that is plotted may not be rendered as a line.
        // Therefore, we use our own line renderer here to draw a trend line.
        this.renderer = new $.jqplot.LineRenderer();
        // prop: rendererOptions
        // Options to pass to the line renderer.
        // By default, markers are not shown on trend lines.
        this.rendererOptions = { marker: { show: true} };
        // prop: label
        // Label for the trend line to use in the legend.
        this.label = '';
        // prop: type
        // Either 'exponential', 'exp', or 'linear'.
        this.type = 'linear';
        // prop: shadow
        // true or false, wether or not to show the shadow.
        this.shadow = true;
        // prop: markerRenderer
        // Renderer to use to draw markers on the line.
        // I think this is wrong.
        this.markerRenderer = { show: true };
        this.neighborThreshold = 4;
        // prop: lineWidth
        // Width of the trend line.
        this.lineWidth = 1.5;
        // prop: shadowAngle
        // Angle of the shadow on the trend line.
        this.shadowAngle = 45;
        // prop: shadowOffset
        // pixel offset for each stroke of the shadow.
        this.shadowOffset = 1.0;
        // prop: shadowAlpha
        // Alpha transparency of the shadow.
        this.shadowAlpha = 0.07;
        // prop: shadowDepth
        // number of strokes to make of the shadow.
        this.shadowDepth = 3;
        this.isTrendline = true;
        this.trendlineCanvas;
        this.shapeRenderer = new $.jqplot.ShapeRenderer();
        this.markerRenderer = new $.jqplot.MarkerRenderer();

        this.instrument = opts.instrument;
        this.timescale = opts.timescale;
        //array of the elements of the form [x, y, timestamp]
        this.data = [];
        this.gridData = [];

        this.slope;
        this.dataSlope;

        //trandline is first drawing
        this.dragging = false;
        //trandline is editing
        this.edit = false;
        this.editDragging = -1;
        this.offsetX = 0;

        //0-right; 1-left;2-both sides
        this.expand = 0;


    };

      
    $.jqplot.Trendline.lineOpts = { lineWidth: 1, color: "#00F" };
    $.jqplot.Trendline.markerOpts = { color: "#00F", isarc: true, lineCap: 'round', fill: true, size: 5 }

    $.jqplot.Trendline.lineOptsSelected = { lineWidth: 1, color: "#F00" };
    $.jqplot.Trendline.markerOptsSelected = { color: "#F00", isarc: true, lineCap: 'round', fill: false, size: 6 }

    $.jqplot.Trendline.TrendlineTypes = { Close: 0, High: 1, Low: 2, FreeHand: 3, HorizontalClose: 4, HorizontalHigh: 5, HorizontalLow: 6, HorizontalFreeHand: 7 };

    

    $.jqplot.TrendlineOverlay = function (instrument, timescale, type) {

        this.trendlines = [];
        // var types = { close: 0, freeLine: 1, highLow: 2 };
        this.type = type;

        this.currentInstrument = instrument;
        this.timescale = timescale;
    }


    // called within scope of a series
    $.jqplot.TrendlineOverlay.init = function (plot, opts, trendlines) {
        plot.plugins.trendlineOverlay = new $.jqplot.TrendlineOverlay(opts.instrument, opts.timescale, opts.type);
        for (var j = 0; j < plot.series[plot.plugins.trendlineOverlay.currentInstrument.index].data.length; j++) {
            plot.plugins.trendlineOverlay.currentInstrument.data[j] = [];
            for (var k = 0; k < plot.series[plot.plugins.trendlineOverlay.currentInstrument.index].data[j].length; k++)
                plot.plugins.trendlineOverlay.currentInstrument.data[j][k] = plot.series[plot.plugins.trendlineOverlay.currentInstrument.index].data[j][k];
        }
        plot.plugins.trendlineOverlay.attachEventListeners(plot);

    }



    $.jqplot.TrendlineOverlay.reInit = function (plot, opts, trendlines) {
        plot.plugins.trendlineOverlay = new $.jqplot.TrendlineOverlay(opts.instrument, opts.timescale, opts.type);
        if (trendlines) plot.plugins.trendlineOverlay.trendlines = trendlines;
    }


    $.jqplot.TrendlineOverlay.prototype.attachEventListeners = function (plot) {
        $.jqplot.Cursor.unbindMouseDown(plot);
        plot.plugins.trendlineOverlay.detachEditEventListeners(plot);
        plot.eventCanvas._elem.unbind('jqplotClick', handleClick);

        if ($.inArray(parseInt(plot.plugins.trendlineOverlay.type), [$.jqplot.Trendline.TrendlineTypes.HorizontalClose, $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand, $.jqplot.Trendline.TrendlineTypes.HorizontalHigh, $.jqplot.Trendline.TrendlineTypes.HorizontalLow]) >= 0) {
            Netdania.Utilities.setCursorByID(plot.targetId, 'url(css/images/cursor/pen_down.cur), auto');
            var trendline = createNewTrendline(plot);
            trendline.dragging = true;
            plot.eventCanvas._elem.bind('jqplotMouseMove', { plot: plot }, handleMouseMoveHorizontal);
            plot.eventCanvas._elem.bind('jqplotMouseUp', { plot: plot }, handleMouseUpHorizontal);
            plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: true }, handleClick);
            plot.eventCanvas._elem.bind('jqplotRightClick', { plot: plot }, handleHorizontalRightClick);
        }
        else {
            plot.eventCanvas._elem.bind('jqplotMouseDown', { plot: plot }, handleMouseDown);
            plot.eventCanvas._elem.bind('jqplotMouseMove', { plot: plot }, handleMouseMove);
            plot.eventCanvas._elem.bind('jqplotMouseUp', { plot: plot }, handleMouseUp);
            plot.eventCanvas._elem.bind('jqplotClick', { plot: plot }, handleClick);
        }

    }

    $.jqplot.TrendlineOverlay.prototype.detachEventListeners = function (plot) {

        if ($.inArray(parseInt(plot.plugins.trendlineOverlay.type), [$.jqplot.Trendline.TrendlineTypes.HorizontalClose, $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand, $.jqplot.Trendline.TrendlineTypes.HorizontalHigh, $.jqplot.Trendline.TrendlineTypes.HorizontalLow]) >= 0) {
            plot.eventCanvas._elem.unbind('jqplotMouseMove', handleMouseMoveHorizontal);
            plot.eventCanvas._elem.unbind('jqplotMouseUp', handleMouseUpHorizontal);
            plot.eventCanvas._elem.unbind('jqplotRightClick', handleHorizontalRightClick);
            removeLastTrendline(plot);
        }
        else {
            plot.eventCanvas._elem.unbind('jqplotMouseDown', handleMouseDown);
            plot.eventCanvas._elem.unbind('jqplotMouseMove', handleMouseMove);
            plot.eventCanvas._elem.unbind('jqplotMouseUp', handleMouseUp);
        }

    }

    $.jqplot.TrendlineOverlay.prototype.attachEditEventListeners = function (plot) {
        plot.eventCanvas._elem.bind('jqplotMouseDown', { plot: plot }, handleEditMouseDown);
        plot.eventCanvas._elem.bind('jqplotMouseMove', { plot: plot }, handleEditMouseMove);
        plot.eventCanvas._elem.bind('jqplotMouseUp', { plot: plot }, handleEditMouseUp);
    }

    $.jqplot.TrendlineOverlay.prototype.detachEditEventListeners = function (plot) {
        plot.eventCanvas._elem.unbind('jqplotMouseDown', handleEditMouseDown);
        plot.eventCanvas._elem.unbind('jqplotMouseMove', handleEditMouseMove);
        plot.eventCanvas._elem.unbind('jqplotMouseUp', handleEditMouseUp);
    }

    // called within scope of series object
    $.jqplot.Trendline.prototype.drawTrendlineWithPoints = function (sctx, gridData, plot, lineOpts) {
        sctx.clearRect(0, 0, sctx.canvas.width, sctx.canvas.height);
        this.shapeRenderer.draw(sctx, [[gridData[0][0], gridData[0][1]], [gridData[1][0], gridData[1][1]]], lineOpts);
        //this.markerRenderer.draw(gridData[0][0], gridData[0][1], sctx, { color: (markerColor !== undefined) ? markerColor : '#f00', isarc: true, lineCap: 'round', fill: true, size: 5 });
    }

    //    $.jqplot.Trendline.prototype.drawTrendline = function (sctx, point, slope, plot, lineOpts, expand) {
    //        if (isNaN(slope)) {
    //            this.drawTrendlineWithPoints(sctx, [point, [point[0], point[1] + 1000]], plot, lineOpts);
    //        }
    //        else {
    //            sctx.clearRect(0, 0, sctx.canvas.width, sctx.canvas.height);
    //            var points = getExpandPoints(point, expand, slope, sctx.canvas.width);
    //            this.shapeRenderer.draw(sctx, points, lineOpts);
    //        }
    //    }

    // called within scope of series object
    $.jqplot.Trendline.prototype.drawTrendlineSlope = function (sctx, point, slope, plot, lineOpts, expand) {
        if (isNaN(slope)) {
            //vertical line
            this.drawTrendlineWithPoints(sctx, [[point[0], point[1] - 1000], [point[0], point[1] + 1000]], plot, lineOpts);
        } else {
            sctx.clearRect(0, 0, sctx.canvas.width, sctx.canvas.height);
            var points = getExpandPoints(point, expand, slope, sctx.canvas.width);
            this.shapeRenderer.draw(sctx, points, lineOpts);

        }
    }

    $.jqplot.TrendlineOverlay.prototype.removeTrendline = function (trendline, plot) {
        //remove trendline canvas
        if (trendline.trendlineCanvas) {
            trendline.trendlineCanvas._ctx.clearRect(0, 0, trendline.trendlineCanvas._ctx.canvas.width, trendline.trendlineCanvas._ctx.canvas.height);
            trendline.trendlineCanvas._ctx = null;
            trendline.trendlineCanvas.resetCanvas();
            trendline.trendlineCanvas = null;
        }


        var id = -1;
        $(this.trendlines).each(function (index, value) {
            if (value == trendline)
                id = index;
        });

        this.trendlines.splice(id, 1);
    }


    function regression(x, y, typ) {
        var N = x.length;
        var slope;
        var intercept;
        var SX = 0;
        var SY = 0;
        var SXX = 0;
        var SXY = 0;
        var SYY = 0;
        var Y = [];
        var X = [];


        X = x;
        Y = y;

        for (var i = 0; i < N; i++) {
            SX = SX + X[i];
            SY = SY + Y[i];
            SXY = SXY + X[i] * Y[i];
            SXX = SXX + X[i] * X[i];
            SYY = SYY + Y[i] * Y[i];
        }
        slope = (N * SXY - SX * SY) / (N * SXX - SX * SX);
        intercept = (SY - slope * SX) / N;
        if (Math.abs(slope) == Infinity) slope = NaN;
        if (Math.abs(intercept) == Infinity) intercept = NaN;
        return [slope, intercept];
    }

    function linearRegression(X, Y) {
        var ret;
        ret = regression(X, Y, 'linear');
        return [ret[0], ret[1]];
    }


    function computeSlope(data) {
        var ret;
        var res;
        var x = [];
        var y = [];
        var ypred = [];

        for (i = 0; i < data.length; i++) {
            if (data[i] != null && data[i][0] != null && data[i][1] != null) {
                x.push(data[i][0]);
                y.push(data[i][1]);
            }
        }

        ret = linearRegression(x, y);
        return ret;
        //        var slope = (data[1][1] - data[0][1]) / (data[1][0] - data[0][0]);
        //        var intercept = data[1][1] - slope * data[1][0];
        //        return [slope, intercept];
    }

    function computeDataSlope(data) {
        var slope = (data[1][1] - data[0][1]) / (data[1][0] - data[0][0]);
        return (slope == Infinity) ? NaN : slope;
    }

    function sortAsc(points) {
        if (points.length == 2) {
            if (points[0][0] > points[1][0]) {
                var interm = points[1];
                points[1] = points[0];
                points[0] = interm;
            }
        }

        return points;
    }


    function getDataPoints(trendline, plot) {
        var data = [];
        for (var i = 0; i < trendline.gridData.length; i++) {
            var dataPos = [];
            var index = Math.round(plot.axes.xaxis.series_p2u(trendline.gridData[i][0]));

            dataPos[0] = index;
            dataPos[1] = plot.axes[plot.options.seriesDefaults.yaxis].series_p2u(trendline.gridData[i][1]);
            dataPos[2] = trendline.instrument.dateTimeArr[index];

            data.push(dataPos);
        }
        //console.log(data);
        return data;
    }


    function getGridPoints(trendline, plot, instrument) {

        var gridData = [];
        var data = trendline.data;
        var index1 = -1;
        var index2 = -1;

        for (var i = 0; i < instrument.dateTimeArr.length; i++) {
            if ((instrument.dateTimeArr[i] == data[0][2])) {
                index1 = i;
                // break;
            }
            if ((instrument.dateTimeArr[i] == data[1][2])) {
                index2 = i;
                // break;
            }
        }

        if (index1 == -1) {
            for (var i = 0; i < instrument.dateTimeArr.length; i++) {
                if (i > 0 && instrument.dateTimeArr[i] < data[0][2] && data[0][2] < instrument.dateTimeArr[i + 1]) {
                    index1 = i;
                    // break;
                }
            }

        }

        if (index1 >= 0 && index2 == -1) {
            if (trendline.dataSlope !== 0)
                index2 = parseInt((trendline.data[1][1] - trendline.data[0][1]) / trendline.dataSlope) + index1;
            else
                index2 = index1 + 100;
        }
        if (index1 == -1 && index2 == -1) {
            index1 = 0;
            index2 = 1;
        }

        var x11 = parseInt(plot.axes.xaxis.series_u2p(index1));
        var y11 = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(trendline.data[0][1]);

        var x22 = parseInt(plot.axes.xaxis.series_u2p(index2));
        var y22 = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(trendline.data[1][1]);
        return [[x11, y11], [x22, y22]];


    }




    function getPoint(gridPos, plot, trendline, isFirst) {

        gridPos.x = plot.axes.xaxis.series_u2p(Math.round(plot.axes.xaxis.series_p2u(gridPos.x)));
        gridPos.y = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(plot.axes[plot.options.seriesDefaults.yaxis].series_p2u(gridPos.y));

        if (trendline !== undefined) {

            var seriesData = trendline.instrument.data;
            var indexC = (seriesData[0].length == 2) ? 1 : (seriesData[0].length == 4) ? 3 : 4;
            var indexH = (seriesData[0].length == 2) ? 1 : (seriesData[0].length == 4) ? 1 : 2;
            var indexL = (seriesData[0].length == 2) ? 1 : (seriesData[0].length == 4) ? 2 : 3;
            var resultData = [];
            if (trendline.type !== $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand && trendline.type !== $.jqplot.Trendline.TrendlineTypes.FreeHand) {
                var data = seriesData[parseInt(plot.axes.xaxis.series_p2u(gridPos.x))];
                var prevData = seriesData[parseInt(plot.axes.xaxis.series_p2u(gridPos.x)) - 1];

                if (data) {
                    resultData = getDataForChartType(data, seriesData, parseInt(plot.axes.xaxis.series_p2u(gridPos.x)), trendline.instrument.chartType, trendline.instrument.decimals);
                }
                else {
                    resultData = getDataForChartType(seriesData[seriesData.length - 1], seriesData, (seriesData.length - 1), trendline.instrument.chartType, trendline.instrument.decimals);
                    gridPos.x = plot.axes.xaxis.series_u2p(seriesData.length - 1);
                }
            }
            switch (parseInt(trendline.type)) {
                case $.jqplot.Trendline.TrendlineTypes.Close:
                    {
                        gridPos.y = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(resultData[indexC]);
                        break;
                    }
                case $.jqplot.Trendline.TrendlineTypes.High:
                    {

                        gridPos.y = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(resultData[indexH]);

                        break;
                    }
                case $.jqplot.Trendline.TrendlineTypes.Low:
                    {

                        gridPos.y = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(resultData[indexL]);

                        break;
                    }
                case $.jqplot.Trendline.TrendlineTypes.HorizontalClose:
                    {

                        gridPos.y = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(resultData[indexC]);

                        if (!isFirst) {
                            trendline.gridData[0][1] = gridPos.y;
                            trendline.expand = 2;
                        }
                        break;
                    }
                case $.jqplot.Trendline.TrendlineTypes.HorizontalHigh:
                    {

                        gridPos.y = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(resultData[indexH]);

                        if (!isFirst) {
                            trendline.gridData[0][1] = gridPos.y;
                            trendline.expand = 2;
                        }
                        break;
                    }
                case $.jqplot.Trendline.TrendlineTypes.HorizontalLow:
                    {

                        gridPos.y = plot.axes[plot.options.seriesDefaults.yaxis].series_u2p(resultData[indexC]);

                        if (!isFirst) {
                            trendline.gridData[0][1] = gridPos.y;
                            trendline.expand = 2;
                        }
                        break;
                    }
                case $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand:
                    {
                        if (!isFirst) {
                            trendline.gridData[0][1] = gridPos.y;
                            trendline.expand = 2;
                        }
                        break;
                    }

                default: break;
            }
        }
        return gridPos;
    }

    function getDataForChartType(data, d, pointIndex, chartType, decimals) {

        var result = [];
        switch (chartType) {
            case this.globalComp.Chart.ChartTypesEnum.HEIKINASHI:
                {
                    var open_prev = 0;
                    for (var i = 0; i <= pointIndex; i++) {
                        var close = (d[i][1] + d[i][2] + d[i][3] + d[i][4]) / 4;

                        if (i == 0) {
                            var open = d[i][1];
                            open_prev = d[i][1];
                        }
                        else {
                            op = (open_prev + (d[i - 1][1] + d[i - 1][2] + d[i - 1][3] + d[i - 1][4]) / 4) / 2;
                            open_prev = open = op;
                        }
                        hi = Math.max(Math.max(d[i][2], open_prev), close);
                        low = Math.min(Math.min(d[i][3], open_prev), close);

                        if (i == pointIndex) {
                            result[0] = pointIndex;
                            result[1] = parseFloat(open.toFixed(decimals));
                            result[2] = parseFloat(hi.toFixed(decimals));
                            result[3] = parseFloat(low.toFixed(decimals));
                            result[4] = parseFloat(close.toFixed(decimals));
                        }
                    }
                    break;
                }
            default: { result = data; break; }
        }
        return result;
    }

    function getExpandPoints(point, expand, slope, maxWidth) {
        var x1, y1, x2, y2;

        x1 = point[0];
        y1 = point[1];

        switch (expand) {
            case 0:
                {
                    x2 = point[0] + 10 * maxWidth;
                    y2 = slope * (x2 - point[0]) + point[1];
                    break;
                }
            case 1:
                {
                    x2 = point[0] - 10 * maxWidth;
                    y2 = slope * (x2 - point[0]) + point[1];
                    break;
                }
            case 2:
                {
                    x1 = point[0] - 10 * maxWidth;
                    y1 = slope * (x1 - point[0]) + point[1];
                    x2 = point[0] + 10 * maxWidth;
                    y2 = slope * (x2 - point[0]) + point[1];
                }
        }
        return [[x1, y1], [x2, y2]];
    }




    $.jqplot.Trendline.drawTrendlines = function (plot, instrument, timescale) {
        $('.jqplot-trendline-canvas').remove();
        if (plot.plugins.trendlineOverlay && plot.plugins.trendlineOverlay.trendlines.length > 0) {
            plot.eventCanvas._elem.bind('jqplotClick', { plot: plot }, handleClick);
            //var newTrendlines = [];
            for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
                var trendline = plot.plugins.trendlineOverlay.trendlines[i];
                if (trendline.instrument.symbol == instrument.symbol && trendline.timescale >= timescale) {

                    for (var j = 0; j < plot.series[trendline.instrument.index].data.length; j++) {
                        trendline.instrument.data[j] = [];
                        for (var k = 0; k < plot.series[trendline.instrument.index].data[j].length; k++)
                            trendline.instrument.data[j][k] = plot.series[trendline.instrument.index].data[j][k];
                    }
                    //console.log('draw:' + trendline.instrument.data[299]);

                    trendline.dragging = false;
                    trendline.gridData = getGridPoints(trendline, plot, instrument);
                    //console.log('draw:' + trendline.slope[0]+' ' +trendline.slope[1]);
                    if (trendline.gridData) {
                        trendline.slope = computeSlope(trendline.gridData, trendline.type);
                        trendline.trendlineCanvas = new $.jqplot.GenericCanvas();
                        plot.eventCanvas._elem.before(trendline.trendlineCanvas.createElement(plot._gridPadding, 'jqplot-trendline-canvas', plot._plotDimensions, plot));
                        trendline.trendlineCanvas.setContext();
                        if (trendline.edit) {
                            editTrendline(plot, { trendlineIndex: i, pointIndex: -1 });
                        }
                        else {
                            trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, trendline.gridData[0], trendline.slope[0], plot, $.jqplot.Trendline.lineOpts , trendline.expand);
                        }
                    }
                    // trendline.instrument.data = plot.series[trendline.instrument.index].data;
                    //trendline.instrument.data = [];

                }
            }
        }
    }

    $.jqplot.Trendline.redrawTrendlines = function (plot, instrument, timescale) {
        if (plot.plugins.trendlineOverlay && plot.plugins.trendlineOverlay.trendlines.length > 0) {
            plot.eventCanvas._elem.bind('jqplotClick', { plot: plot }, handleClick);
            for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
                var trendline = plot.plugins.trendlineOverlay.trendlines[i];
                if (trendline.instrument.symbol == instrument.symbol && trendline.timescale >= timescale) {
                    //  trendline.instrument.data = plot.series[trendline.instrument.index].data;
                    for (var j = 0; j < plot.series[trendline.instrument.index].data.length; j++) {
                        trendline.instrument.data[j] = [];
                        for (var k = 0; k < plot.series[trendline.instrument.index].data[j].length; k++)
                            trendline.instrument.data[j][k] = plot.series[trendline.instrument.index].data[j][k];
                    }
                    trendline.gridData = getGridPoints(trendline, plot, instrument);
                    //console.log('redraw:'+ trendline.slope[0]+' '+trendline.slope[1]);
                    if (trendline.gridData) {
                        trendline.slope = computeSlope(trendline.gridData, trendline.type);
                        trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, trendline.gridData[0], trendline.slope[0], plot, $.jqplot.Trendline.lineOpts , trendline.expand);
                        trendline.instrument = instrument;
                    }

                }
            }
        }
    }


    $.jqplot.Trendline.updateTrendlines = function (plot, instrument, timescale) {
        if (plot.plugins.trendlineOverlay && plot.plugins.trendlineOverlay.trendlines.length > 0) {
            for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
                var trendline = plot.plugins.trendlineOverlay.trendlines[i];
                if (trendline.instrument.symbol == instrument.symbol && trendline.timescale >= timescale) {
                    for (var j = 0; j < trendline.data.length; j++) {
                        trendline.data[j][0] -= 1;
                    }
                }

            }
        }
    }

    // function to check if event location is over a area area
    function checkIntersection(gridpos, plot) {
        var trendlines = plot.plugins.trendlineOverlay.trendlines;
        x = gridpos.x;
        y = gridpos.y;
        var d0;
        var minDistance = 3;
        var trendlineIndex = -1;
        var pointIndex = -1;
        for (i = trendlines.length - 1; i >= 0; i--) {

            var trendline = trendlines[i];

            if (isNaN(trendline.slope[0])) {
                if (Math.abs(trendline.gridData[0][0] - gridpos.x) < minDistance) {
                    // minDistance = Math.abs(slope[0] - trendline.slope[0]);
                    trendlineIndex = i;
                    //  return { trendlineIndex: trendlineIndex, pointIndex: pointIndex };
                }
            }
            else {
                if (trendline.slope[0] == 0) {
                    if (Math.abs(gridpos.y - trendline.gridData[0][1]) < minDistance)
                        trendlineIndex = i;
                }
                else {
                    //console.log(trendline.slope[0], trendline.slope[1], gridpos.x, gridpos.y);
                    var dist = Math.abs((gridpos.x * trendline.slope[0] - gridpos.y + trendline.slope[1]) / Math.sqrt(trendline.slope[0] * trendline.slope[0] + 1));
                    if (dist < minDistance && ((gridpos.x >= trendline.gridData[0][0] && trendline.expand == 0) || (gridpos.x <= trendline.gridData[0][0] && trendline.expand == 1) || trendline.expand == 2))
                        trendlineIndex = i;
                }
                //  return { trendlineIndex: trendlineIndex, pointIndex: pointIndex };
            }

            if (trendlineIndex > -1) {
                var t = trendline.markerRenderer.size * 2;
                var threshold = (t > 0) ? t : 0;

                for (var j = 0; j < trendline.gridData.length; j++) {
                    p = trendline.gridData[j];
                    //check if they have the same slope
                    if (p[0] != null && p[1] != null) {
                        d = Math.sqrt((x - p[0]) * (x - p[0]) + (y - p[1]) * (y - p[1]));
                        if (d <= threshold) {
                            pointIndex = j;
                            trendlineIndex = i;
                            //   return { trendlineIndex: trendlineIndex, pointIndex: pointIndex };
                        }
                    }

                }
            }


        }
        return { trendlineIndex: trendlineIndex, pointIndex: pointIndex };
    }


    // function to check if event location is over a area area
    function checkTrendlineIntersection(gridpos, trendline) {

        x = gridpos.x;
        y = gridpos.y;
        var d0;
        var minDistance = 14;
        var pointIndex = -1;
        var pointOnLine = false;

        slope = computeSlope([[trendline.gridData[0][0], trendline.gridData[0][1]], [gridpos.x, gridpos.y]], trendline.type);

        if (isNaN(trendline.slope[0])) {
            if (Math.abs(trendline.gridData[0][0] - gridpos.x) < minDistance) {
                // minDistance = Math.abs(slope[0] - trendline.slope[0]);
                pointOnLine = true;
            }
        }
        else {
            if (trendline.slope[0] == 0) {
                if (Math.abs(gridpos.y - trendline.gridData[0][1]) < minDistance)
                    pointOnLine = true;
            }
            else {
                var dist = Math.abs((gridpos.x * trendline.slope[0] - gridpos.y + trendline.slope[1]) / Math.sqrt(trendline.slope[0] * trendline.slope[0] + 1));
                if (dist < minDistance)
                    pointOnLine = true;
            }
        }

        var t = trendline.markerRenderer.size * 2;
        var threshold = (t > 0) ? t : 0;

        for (var j = 0; j < trendline.gridData.length; j++) {
            p = trendline.gridData[j];
            //check if they have the same slope
            if (p[0] != null && p[1] != null) {
                d = Math.sqrt((x - p[0]) * (x - p[0]) + (y - p[1]) * (y - p[1]));
                if (d <= threshold && (d <= d0 || d0 == null)) {
                    d0 = d;
                    pointIndex = j;
                }
            }
        }
        return { pointOnLine: pointOnLine, pointIndex: pointIndex };
    }

    this.deleteTrendline = function (eventParams) {
        if (eventParams.plot.plugins.trendlineOverlay !== undefined && eventParams.plot.plugins.trendlineOverlay !== null && eventParams.plot.plugins.trendlineOverlay.trendlines[eventParams.intersection.trendlineIndex]) {
            eventParams.plot.plugins.trendlineOverlay.removeTrendline(eventParams.plot.plugins.trendlineOverlay.trendlines[eventParams.intersection.trendlineIndex]);
            eventParams.plot.plugins.trendlineOverlay.detachEditEventListeners(eventParams.plot);
            eventParams.plot.plugins.trendlineOverlay.detachEventListeners(eventParams.plot);
            $.jqplot.Cursor.bindMouseDown(eventParams.plot);
        }
        if (eventParams.plot.plugins.trendlineOverlay !== undefined && eventParams.plot.plugins.trendlineOverlay !== null && eventParams.plot.plugins.trendlineOverlay.trendlines.length == 0)
            removeTrendlineMode(eventParams.plot);
        eventParams.plot.eventCanvas._elem.removeClass('context-menu-one');
    }

    var action = null; //used to delete the trendline when the delete button is pressed

    function editTrendline(plot, intersection) {

        var eventParams = { plot: plot, intersection: intersection }
        if (action !== null) { Netdania.Utilities.RemoveKeyboardEvent(action); }
        action = Netdania.Utilities.AttachKeyboardEvent(46, this.deleteTrendline, eventParams);

        //console.log(intersection.trendlineIndex);
        $.jqplot.Cursor.unbindMouseDown(plot);

        var trendline = plot.plugins.trendlineOverlay.trendlines[intersection.trendlineIndex];

        trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, trendline.gridData[0], trendline.slope[0], plot, $.jqplot.Trendline.lineOptsSelected, trendline.expand);
        trendline.markerRenderer.draw(trendline.gridData[0][0], trendline.gridData[0][1], trendline.trendlineCanvas._ctx, $.jqplot.Trendline.markerOptsSelected);
        trendline.markerRenderer.draw(trendline.gridData[1][0], trendline.gridData[1][1], trendline.trendlineCanvas._ctx, $.jqplot.Trendline.markerOptsSelected);
        trendline.edit = true;

        plot.plugins.trendlineOverlay.detachEventListeners(plot);
        plot.plugins.trendlineOverlay.detachEditEventListeners(plot);
        plot.plugins.trendlineOverlay.attachEditEventListeners(plot);

        plot.eventCanvas._elem.unbind('jqplotRightClick', handleRightClick);
        plot.eventCanvas._elem.bind('jqplotRightClick', { plot: plot, intersection: intersection }, handleEditRightClick);

    }

    function clearTrendlines(plot) {
        var newTrendlines = [];
        if (plot.plugins.trendlineOverlay !== undefined) {
            for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
                var trendline = plot.plugins.trendlineOverlay.trendlines[i];
                if (trendline.gridData.length == 2) {
                    if (trendline.edit) {
                        trendline.edit = false;
                        trendline.editDragging = -1;
                        trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, trendline.gridData[0], trendline.slope[0], plot, $.jqplot.Trendline.lineOpts , trendline.expand);
                    }
                    newTrendlines.push(trendline);
                }
                else {
                    if (trendline.trendlineCanvas) {
                        trendline.trendlineCanvas._ctx.clearRect(0, 0, trendline.trendlineCanvas._ctx.canvas.width, trendline.trendlineCanvas._ctx.canvas.height);
                        trendline.trendlineCanvas._ctx = null;
                        trendline.trendlineCanvas.resetCanvas();
                        trendline.trendlineCanvas = null;
                    }

                }
            }
            plot.eventCanvas._elem.removeClass('context-menu-one');
            removeContextMenu();
            plot.plugins.trendlineOverlay.trendlines = newTrendlines;
        }
    }

    function removeLastTrendline(plot) {
        var newTrendlines = [];
        for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
            var trendline = plot.plugins.trendlineOverlay.trendlines[i];
            if (trendline.gridData.length == 2) {
                newTrendlines.push(trendline);
            }
            else {
                if (trendline.trendlineCanvas) {
                    trendline.trendlineCanvas._ctx.clearRect(0, 0, trendline.trendlineCanvas._ctx.canvas.width, trendline.trendlineCanvas._ctx.canvas.height);
                    trendline.trendlineCanvas._ctx = null;
                    trendline.trendlineCanvas.resetCanvas();
                    trendline.trendlineCanvas = null;
                }

            }
        }
        plot.plugins.trendlineOverlay.trendlines = newTrendlines;
    }

    $.jqplot.Trendline.removeTrendlineMode = function (plot) {
        clearTrendlines(plot);
        if (plot.plugins.trendlineOverlay !== undefined && plot.plugins.trendlineOverlay !== null) {
            plot.plugins.trendlineOverlay.detachEditEventListeners(plot);
            plot.plugins.trendlineOverlay.detachEventListeners(plot);
            $.jqplot.Cursor.bindMouseDown(plot);
            //plot.eventCanvas._elem.css("cursor", "crosshair");
            Netdania.Utilities.setCursorByID(plot.targetId, 'crosshair');
            plot.eventCanvas._elem.unbind('jqplotRightClick', handleEditRightClick);
            removeContextMenu();

            plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: false }, handleClick);

            setUpdate(true);
        }
    }

    function removeTrendlineMode(plot) {
        //  if (this.globalComp.Chart.getChartState().getTrendlineMode()) {
        clearTrendlines(plot);
        if (plot.plugins.trendlineOverlay !== undefined && plot.plugins.trendlineOverlay !== null) {
            plot.plugins.trendlineOverlay.detachEditEventListeners(plot);
            plot.plugins.trendlineOverlay.detachEventListeners(plot);

            //plot.eventCanvas._elem.css("cursor", "crosshair");
            Netdania.Utilities.setCursorByID(plot.targetId, 'crosshair');
            plot.eventCanvas._elem.unbind('jqplotRightClick', handleEditRightClick);
            removeContextMenu();

            plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: false }, handleClick);

            setUpdate(true);

            $.jqplot.Cursor.bindMouseDown(plot);
        }
        //  }
    }

    function createNewTrendline(plot) {
        var trendline = new $.jqplot.Trendline({ instrument: plot.plugins.trendlineOverlay.currentInstrument, timescale: plot.plugins.trendlineOverlay.timescale });
        //console.log(plot.plugins.trendlineOverlay.type);
        trendline.type = plot.plugins.trendlineOverlay.type;
        plot.plugins.trendlineOverlay.trendlines.push(trendline);
        trendline.trendlineCanvas = new $.jqplot.GenericCanvas();
        plot.eventCanvas._elem.before(trendline.trendlineCanvas.createElement(plot._gridPadding, 'jqplot-trendline-canvas', plot._plotDimensions, plot));
        trendline.trendlineCanvas.setContext();
        //console.log($.inArray(parseInt(trendline.type), [TrendlineTypes.HorizontalClose, $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand, $.jqplot.Trendline.TrendlineTypes.HorizontalHigh]));
        if ($.inArray(parseInt(trendline.type), [$.jqplot.Trendline.TrendlineTypes.HorizontalClose, $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand, $.jqplot.Trendline.TrendlineTypes.HorizontalHigh, $.jqplot.Trendline.TrendlineTypes.HorizontalLow]) >= 0) {
            trendline.expand = 2;
        }
        return trendline;
    }

    function cloneTrendline(plot, trendlineIndex) {
        clearTrendlines(plot);
        var trendline = plot.plugins.trendlineOverlay.trendlines[trendlineIndex];
        var newTrendline = new $.jqplot.Trendline({ instrument: plot.plugins.trendlineOverlay.currentInstrument, timescale: plot.plugins.trendlineOverlay.timescale });
        newTrendline.type = trendline.type;
        plot.plugins.trendlineOverlay.trendlines.push(newTrendline);
        newTrendline.trendlineCanvas = new $.jqplot.GenericCanvas();
        plot.eventCanvas._elem.before(newTrendline.trendlineCanvas.createElement(plot._gridPadding, 'jqplot-trendline-canvas', plot._plotDimensions, plot));
        newTrendline.trendlineCanvas.setContext();
        newTrendline.expand = trendline.expand;
        newTrendline.slope = trendline.slope;
        //trendline.edit = false;
        //trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, [trendline.gridData[0][0], trendline.gridData[0][1]], trendline.slope[0], plot, $.jqplot.Trendline.lineOpts , trendline.expand);

        newTrendline.gridData.push([trendline.gridData[0][0], trendline.gridData[0][1]]);
        newTrendline.gridData.push([trendline.gridData[1][0], trendline.gridData[1][1]]);
        newTrendline.slope = computeSlope(newTrendline.gridData);
        newTrendline.data = getDataPoints(newTrendline, plot);
        newTrendline.dataSlope = computeDataSlope(newTrendline.data);
        newTrendline.offsetX = trendline.offsetX;
        //newTrendline.edit = true;

        editTrendline(plot, { trendlineIndex: plot.plugins.trendlineOverlay.trendlines.length - 1, pointIndex: -1 });
        newTrendline.editDragging = 3;

    }

    function setUpdate(value) {
        this.globalComp.Chart.getChartState().setTrendlineMode(!value);
        // this.globalComp.Chart.setCanUpdatePlot(value);
        //this.globalComp.Chart.setRedrawTrendlines(value);
    }
    // function replot(plot) { this.globalComp.Chart.getSelf().replotPublic(plot, { resetAxes: true }, this.globalComp.Chart.getSelf()); }

    //----------------------------------------------events-----------------------------------------------
    function handleClick(ev, gridpos, datapos, neighbor, plot) {
        //if (action !== null) { Netdania.Utilities.RemoveKeyboardEvent(action); }
        plot.eventCanvas._elem.unbind('jqplotClick', handleClick);
        if (!ev.data.mouseIsUp) {

            if (plot.plugins.trendlineOverlay.trendlines.length > 0) {

                clearTrendlines(plot);

                var intersection = checkIntersection(gridpos, plot);
                plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: false }, handleClick);
                if (intersection.trendlineIndex > -1) {
                    setUpdate(false);
                    editTrendline(plot, intersection);
                }
                else {
                    if (action !== null) { Netdania.Utilities.RemoveKeyboardEvent(action); }
                    //console.log('remove 1');
                    removeTrendlineMode(plot);
                }
            }
            else {
                Netdania.Utilities.setCursorByID(plot.targetId, 'crosshair');
                if (action !== null) { Netdania.Utilities.RemoveKeyboardEvent(action); }
                //console.log('remove 2');
                removeTrendlineMode(plot);
            }
        }
        else { Netdania.Utilities.setCursorByID(plot.targetId, 'crosshair'); }
    }

    function handleMouseDown(ev, gridpos, datapos, neighbor, plot) {
        //plot.eventCanvas._elem.css("cursor", "url(css/images/cursor/pen_down.cur), auto");
        Netdania.Utilities.setCursorByID(plot.targetId, 'url(css/images/cursor/pen_down.cur), auto');
        var trendline = createNewTrendline(plot);

        gridpos = getPoint(gridpos, plot, trendline, true);
        trendline.drawTrendlineWithPoints(trendline.trendlineCanvas._ctx, [[gridpos.x, gridpos.y], [gridpos.x, gridpos.y]], plot, $.jqplot.Trendline.lineOpts , trendline.expand);
        trendline.gridData.push([gridpos.x, gridpos.y]);
        trendline.dragging = true;

        plot.eventCanvas._elem.unbind('jqplotClick', handleClick);
    }

    function handleMouseMove(ev, gridpos, datapos, neighbor, plot) {
        Netdania.Utilities.setCursorByID(plot.targetId, 'url(css/images/cursor/pen_down.cur), auto');
        //plot.eventCanvas._elem.css("cursor", "url(css/images/cursor/pen_down.cur), auto");
        if (plot.plugins.trendlineOverlay && plot.plugins.trendlineOverlay.trendlines.length > 0) {
            for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
                var trendline = plot.plugins.trendlineOverlay.trendlines[i];
                if (trendline.dragging) {
                    trendline.gridData.splice(1, 1);
                    gridpos = getPoint(gridpos, plot, trendline);
                    trendline.gridData.push([gridpos.x, gridpos.y]);
                    //trendline.data = getDataPoints(trendline, plot);
                    trendline.slope = computeSlope(trendline.gridData, trendline.type);
                    if (!isNaN(trendline.slope[0])) {
                        trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, [trendline.gridData[0][0], trendline.gridData[0][1]], trendline.slope[0], plot, $.jqplot.Trendline.lineOpts , 2);
                        trendline.markerRenderer.draw(trendline.gridData[1][0], trendline.gridData[1][1], trendline.trendlineCanvas._ctx, $.jqplot.Trendline.markerOpts);
                        trendline.data = getDataPoints(trendline, plot);
                        trendline.dataSlope = computeDataSlope(trendline.data);
                    }

                }

            }
        }
    }


    function handleMouseMoveHorizontal(ev, gridpos, datapos, neighbor, plot) {
        // if (($.inArray(parseInt(trendline.type), [$.jqplot.Trendline.TrendlineTypes.HorizontalClose, $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand, $.jqplot.Trendline.TrendlineTypes.HorizontalHigh]) >= 0)) {
        Netdania.Utilities.setCursorByID(plot.targetId, 'url(css/images/cursor/pen_down.cur), auto');
        if (plot.plugins.trendlineOverlay && plot.plugins.trendlineOverlay.trendlines.length > 0) {
            for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
                var trendline = plot.plugins.trendlineOverlay.trendlines[i];
                if (trendline.dragging) {
                    //trendline.gridData.splice(1, 1);
                    //trendline.gridData = [];
                    gridpos = getPoint(gridpos, plot, trendline, true);
                    //trendline.gridData.push([gridpos.x, gridpos.y]);
                    // trendline.gridData.push([trendline.gridData[0][0] + 100, trendline.gridData[0][1]]);
                    // trendline.data = getDataPoints(trendline, plot);
                    // trendline.slope = computeSlope(trendline.gridData, trendline.type);
                    trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, [gridpos.x, gridpos.y], 0, plot, $.jqplot.Trendline.lineOpts , 2);
                    trendline.markerRenderer.draw(gridpos.x, gridpos.y, trendline.trendlineCanvas._ctx, $.jqplot.Trendline.markerOpts);
                }

            }
        }
        // }
    }

    function handleMouseUpHorizontal(ev, gridpos, datapos, neighbor, plot) {
        //  if (($.inArray(parseInt(trendline.type), [$.jqplot.Trendline.TrendlineTypes.HorizontalClose, $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand, $.jqplot.Trendline.TrendlineTypes.HorizontalHigh]) >= 0)) {
        for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
            var trendline = plot.plugins.trendlineOverlay.trendlines[i];
            if (trendline.dragging) {
                trendline.dragging = false;
                gridpos = getPoint(gridpos, plot, trendline, true);
                trendline.gridData.push([gridpos.x, gridpos.y]);
                trendline.gridData.push([trendline.gridData[0][0] + 100, trendline.gridData[0][1]]);
                trendline.data = getDataPoints(trendline, plot);
                trendline.dataSlope = computeDataSlope(trendline.data);
                trendline.slope = [0, 100];
                trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, trendline.gridData[0], trendline.slope[0], plot, $.jqplot.Trendline.lineOpts , trendline.expand);
            }
        }
        plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: true }, handleClick);
        var newTrendline = createNewTrendline(plot);
        newTrendline.dragging = true;
        //console.log(plot.plugins.trendlineOverlay.trendlines);
    }

    function handleHorizontalRightClick(ev, gridpos, datapos, neighbor, plot) {
        if (plot.plugins.trendlineOverlay.trendlines.length > 0) {

            clearTrendlines(plot);

            var intersection = checkIntersection(gridpos, plot);
            plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: false }, handleClick);
            if (intersection.trendlineIndex > -1) {
                setUpdate(false);
                editTrendline(plot, intersection);
            }
            else {
                removeTrendlineMode(plot);
            }
        }
    }

    function handleMouseUp(ev, gridpos, datapos, neighbor, plot) {
        var newTrendlines = [];
        for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
            var trendline = plot.plugins.trendlineOverlay.trendlines[i];
            if ((trendline.gridData.length == 1 || (trendline.slope && isNaN(trendline.slope[0]) && i == (plot.plugins.trendlineOverlay.trendlines.length - 1))) && trendline.trendlineCanvas) {
                trendline.trendlineCanvas._ctx.clearRect(0, 0, trendline.trendlineCanvas._ctx.canvas.width, trendline.trendlineCanvas._ctx.canvas.height);
                trendline.trendlineCanvas._ctx = null;
                plot.eventCanvas._elem.unbind('jqplotClick', handleClick);
                plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: false }, handleClick);
            }
            else {
                if (trendline.dragging) {
                    trendline.dragging = false;
                    trendline.gridData = sortAsc(trendline.gridData);
                    trendline.data = sortAsc(trendline.data);
                    //                    trendline.data = getDataPoints(trendline, plot);
                    //                    trendline.dataSlope = computeDataSlope(trendline.data);
                    trendline.slope = computeSlope(trendline.gridData);
                    trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, trendline.gridData[0], trendline.slope[0], plot, $.jqplot.Trendline.lineOpts , trendline.expand);
                }

                newTrendlines.push(trendline);
                plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: true }, handleClick);
                plot.eventCanvas._elem.bind('jqplotRightClick', { plot: plot }, handleRightClick);

            }
        }
        plot.plugins.trendlineOverlay.trendlines = newTrendlines;
    }

    function handleEditMouseDown(ev, gridpos, datapos, neighbor, plot) {
        //console.log('down');
        plot.eventCanvas._elem.unbind('jqplotClick', handleClick);
        gridpos = getPoint(gridpos, plot);
        var trendlines = plot.plugins.trendlineOverlay.trendlines;
        for (var i = 0; i < trendlines.length; i++) {
            if (trendlines[i].edit) {
                var intersection = checkTrendlineIntersection(gridpos, trendlines[i]);
                if (intersection.pointIndex > -1) {
                    trendlines[i].editDragging = intersection.pointIndex;
                }
                else if (intersection.pointOnLine) {
                    trendlines[i].editDragging = 3;
                }
                gridpos = getPoint(gridpos, plot);
                trendlines[i].offsetX = gridpos.x - trendlines[i].gridData[0][0];
            }
        }
    }

    function handleEditMouseMove(ev, gridpos, datapos, neighbor, plot) {
        //console.log('move');

        if (plot.plugins.trendlineOverlay && plot.plugins.trendlineOverlay.trendlines.length > 0) {
            for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
                var trendline = plot.plugins.trendlineOverlay.trendlines[i];
                if (trendline.editDragging > -1) {
                    if (trendline.editDragging < 3) {
                        gridpos = getPoint(gridpos, plot, trendline);
                        trendline.gridData[trendline.editDragging] = [gridpos.x, gridpos.y];
                        trendline.slope = computeSlope(trendline.gridData, trendline.type);
                        //trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, [trendline.gridData[0][0], trendline.gridData[0][1]], trendline.slope[0], plot, $.jqplot.Trendline.lineOptsSelected, 2);
                    }
                    else {
                        if ($.inArray(parseInt(plot.plugins.trendlineOverlay.type), [$.jqplot.Trendline.TrendlineTypes.HorizontalClose, $.jqplot.Trendline.TrendlineTypes.HorizontalFreeHand, $.jqplot.Trendline.TrendlineTypes.HorizontalHigh, $.jqplot.Trendline.TrendlineTypes.HorizontalLow]) >= 0) {
                            gridpos = getPoint(gridpos, plot, trendline);
                            trendline.gridData[1][0] = gridpos.x + trendline.offsetX;
                            trendline.gridData[0][0] = gridpos.x; // -trendline.offsetX;
                            if (!isNaN(trendline.slope[0])) {
                                var b = trendline.slope[0] * gridpos.x - gridpos.y;
                                trendline.gridData[0][1] = trendline.slope[0] * trendline.gridData[0][0] - b;
                                trendline.gridData[1][1] = trendline.slope[0] * trendline.gridData[1][0] - b;
                            }

                        }
                        else {

                            gridpos = getPoint(gridpos, plot, trendline);

                            trendline.gridData[1][0] = gridpos.x + (trendline.gridData[1][0] - trendline.gridData[0][0] - trendline.offsetX);
                            trendline.gridData[0][0] = gridpos.x - trendline.offsetX;
                            if (!isNaN(trendline.slope[0])) {
                                var b = trendline.slope[0] * gridpos.x - gridpos.y;
                                trendline.gridData[0][1] = trendline.slope[0] * trendline.gridData[0][0] - b;
                                trendline.gridData[1][1] = trendline.slope[0] * trendline.gridData[1][0] - b;
                            }
                            trendline.type = $.jqplot.Trendline.TrendlineTypes.FreeHand;
                        }

                        //trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, [trendline.gridData[0][0], trendline.gridData[0][1]], trendline.slope[0], plot, $.jqplot.Trendline.lineOptsSelected, 2);
                    }
                    trendline.drawTrendlineSlope(trendline.trendlineCanvas._ctx, [trendline.gridData[0][0], trendline.gridData[0][1]], trendline.slope[0], plot, $.jqplot.Trendline.lineOptsSelected, 2);
                    trendline.markerRenderer.draw(trendline.gridData[0][0], trendline.gridData[0][1], trendline.trendlineCanvas._ctx, $.jqplot.Trendline.markerOptsSelected);
                    trendline.markerRenderer.draw(trendline.gridData[1][0], trendline.gridData[1][1], trendline.trendlineCanvas._ctx, $.jqplot.Trendline.markerOptsSelected);
                }
            }
        }
    }

    function handleEditMouseUp(ev, gridpos, datapos, neighbor, plot) {
        //console.log('up');
        plot.eventCanvas._elem.unbind('jqplotClick', handleClick);
        var isMouseUp = false;
        for (var i = 0; i < plot.plugins.trendlineOverlay.trendlines.length; i++) {
            var trendline = plot.plugins.trendlineOverlay.trendlines[i];
            trendline.gridData = sortAsc(trendline.gridData);
            if (trendline.editDragging > -1) {
                trendline.editDragging = -1;
                trendline.slope = computeSlope(trendline.gridData);
                trendline.data = getDataPoints(trendline, plot);
                trendline.dataSlope = computeDataSlope(trendline.data);
                trendline.data = sortAsc(trendline.data);
                isMouseUp = true;
            }
        }
        //  console.log('mouse up: '+ isMouseUp);
        plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: isMouseUp }, handleClick);
    }


    function handleEditRightClick(ev, gridpos, datapos, neighbor, plot) {
        plot.plugins.trendlineOverlay.detachEditEventListeners(plot);
        var intersection = ev.data.intersection;

        plot.eventCanvas._elem.addClass('context-menu-one');
        addContextMenu(plot, intersection, gridpos);
        plot.eventCanvas._elem.unbind('jqplotRightClick', handleEditRightClick);

        plot.eventCanvas._elem.unbind('jqplotClick', handleClick);
        plot.eventCanvas._elem.bind('jqplotClick', { plot: plot, mouseIsUp: false }, handleClick);
    }

    function handleRightClick(ev, gridpos, datapos, neighbor, plot) {
        removeContextMenu();
        if (plot.plugins.trendlineOverlay.trendlines.length > 0) {
            clearTrendlines(plot);
        }
        removeTrendlineMode(plot);

    }


    //---------------------------------------------------------------------------------------------------

    function addContextMenu(plot, intersection, gridpos) {
        removeContextMenu();

        $.contextMenu('create', {
            selector: '.context-menu-one',
            // position: function ($menu, x, y) { $menu.css({ top: gridpos.y, left: gridpos.x }); },
            build: function ($trigger, e) {
                // this callback is executed every time the menu is to be shown
                // its results are destroyed every time the menu is hidden
                // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                return {
                    callback: function (key, options) {
                    },
                    items: {
                        "Delete": {
                            name: "Delete",
                            //icon: "delete",
                            className: 'ui-menu-item',
                            callback: function (key, options) {
                                if (plot.plugins.trendlineOverlay.trendlines[intersection.trendlineIndex]) {
                                    plot.plugins.trendlineOverlay.removeTrendline(plot.plugins.trendlineOverlay.trendlines[intersection.trendlineIndex]);
                                    plot.plugins.trendlineOverlay.detachEditEventListeners(plot);
                                    plot.plugins.trendlineOverlay.detachEventListeners(plot);
                                    $.jqplot.Cursor.bindMouseDown(plot);
                                }
                                if (plot.plugins.trendlineOverlay.trendlines.length == 0)
                                    removeTrendlineMode(plot);
                                plot.eventCanvas._elem.removeClass('context-menu-one');
                            }
                        },
                        "Duplicate": {
                            name: "Duplicate",
                            //icon: "paste",
                            className: 'ui-menu-item',
                            callback: function (key, options) {
                                cloneTrendline(plot, intersection.trendlineIndex);
                                plot.eventCanvas._elem.removeClass('context-menu-one');
                            }
                        }

                    }
                };
            },
            className: 'fg-toolbar ui-widget-header ui-corner-all ui-helper-clearfix ui-menu ui-widget ui-widget-content'
            //ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only
        });
    }


    function removeContextMenu() {
        if ($.contextMenu !== undefined)
            $.contextMenu('destroy');
    }

})(jQuery);
