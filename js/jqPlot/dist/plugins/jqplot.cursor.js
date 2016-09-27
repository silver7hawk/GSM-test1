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
 * Version: @VERSION
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
    * Class: $.jqplot.Cursor
    * Plugin class representing the cursor as displayed on the plot.
    */
    $.jqplot.Cursor = function (options) {
        // Group: Properties
        //
        // prop: style
        // CSS spec for cursor style
        this.style = 'pointer';
        this.previousCursor = 'auto';
        // prop: show
        // wether to show the cursor or not.
        this.show = $.jqplot.config.enablePlugins;
        // when highlighter plugin available, highlight along with moveLine
        this.highlight = false;
        // prop: showTooltip
        // show a cursor position tooltip.  Location of the tooltip
        // will be controlled by followMouse and tooltipLocation.
        this.showTooltip = true;
        // prop: followMouse
        // Tooltip follows the mouse, it is not at a fixed location.
        // Tooltip will show on the grid at the location given by
        // tooltipLocation, offset from the grid edge by tooltipOffset.
        this.followMouse = false;
        // prop: tooltipLocation
        // Where to position tooltip.  If followMouse is true, this is
        // relative to the cursor, otherwise, it is relative to the grid.
        // One of 'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'
        this.tooltipLocation = 'se';
        // prop: tooltipOffset
        // Pixel offset of tooltip from the grid boudaries or cursor center.
        this.tooltipOffset = 6;
        // prop: showTooltipGridPosition
        // show the grid pixel coordinates of the mouse.
        this.showTooltipGridPosition = false;
        // prop: showTooltipUnitPosition
        // show the unit (data) coordinates of the mouse.
        this.showTooltipUnitPosition = true;
        // prop: showTooltipDataPosition
        // Used with showVerticalLine to show intersecting data points in the tooltip.
        this.showTooltipDataPosition = false;
        // prop: tooltipFormatString
        // sprintf format string for the tooltip.
        // Uses Ash Searle's javascript sprintf implementation
        // found here: http://hexmen.com/blog/2007/03/printf-sprintf/
        // See http://perldoc.perl.org/functions/sprintf.html for reference
        // Note, if showTooltipDataPosition is true, the default tooltipFormatString
        // will be set to the cursorLegendFormatString, not the default given here.
        this.tooltipFormatString = '%.4P, %.4P';
        // prop: useAxesFormatters
        // Use the x and y axes formatters to format the text in the tooltip.
        this.useAxesFormatters = true;
        // prop: tooltipAxisGroups
        // Show position for the specified axes.
        // This is an array like [['xaxis', 'yaxis'], ['xaxis', 'y2axis']]
        // Default is to compute automatically for all visible axes.
        this.tooltipAxisGroups = [];
        // prop: zoom
        // Enable plot zooming.
        this.zoom = false;
        // zoomProxy and zoomTarget properties are not directly set by user.  
        // They Will be set through call to zoomProxy method.
        this.zoomProxy = false;
        this.zoomTarget = false;
        this.zoomRange = false;
        // prop: looseZoom
        // Will expand zoom range to provide more rounded tick values.
        // Works only with linear, log and date axes.
        this.looseZoom = true;
        // prop: clickReset
        // Will reset plot zoom if single click on plot without drag.
        this.clickReset = false;
        // prop: dblClickReset
        // Will reset plot zoom if double click on plot without drag.
        this.dblClickReset = true;
        // prop: showVerticalLine
        // draw a vertical line across the plot which follows the cursor.
        // When the line is near a data point, a special legend and/or tooltip can
        // be updated with the data values.
        this.showVerticalLine = false;
        // prop: showHorizontalLine
        // draw a horizontal line across the plot which follows the cursor.
        this.showHorizontalLine = false;
        // prop: constrainZoomTo
        // 'none', 'x' or 'y'
        this.constrainZoomTo = 'none';
        // // prop: autoscaleConstraint
        // // when a constrained axis is specified, true will
        // // auatoscale the adjacent axis.
        // this.autoscaleConstraint = true;
        this.shapeRenderer = new $.jqplot.ShapeRenderer();
        this._zoom = { start: [], end: [], started: false, zooming: false, isZoomed: false, axes: { start: {}, end: {} }, gridpos: {}, datapos: {}, reset: false };
        this._tooltipElem;
        this.zoomCanvas;
        this.cursorCanvas;
        // prop: intersectionThreshold
        // pixel distance from data point or marker to consider cursor lines intersecting with point.
        // If data point markers are not shown, this should be >= 1 or will often miss point intersections.
        this.intersectionThreshold = 2;
        // prop: showCursorLegend
        // Replace the plot legend with an enhanced legend displaying intersection information.
        this.showCursorLegend = false;
        // prop: cursorLegendFormatString
        // Format string used in the cursor legend.  If showTooltipDataPosition is true,
        // this will also be the default format string used by tooltipFormatString.
        this.cursorLegendFormatString = $.jqplot.Cursor.cursorLegendFormatString;
        // whether the cursor is over the grid or not.
        this._oldHandlers = { onselectstart: null, ondrag: null, onmousedown: null };
        // prop: constrainOutsideZoom
        // True to limit actual zoom area to edges of grid, even when zooming
        // outside of plot area.  That is, can't zoom out by mousing outside plot.
        this.constrainOutsideZoom = true;
        // prop: showTooltipOutsideZoom
        // True will keep updating the tooltip when zooming of the grid.
        this.showTooltipOutsideZoom = false;
        // true if mouse is over grid, false if not.
        this.onGrid = false;

        this.followMouseValue = true;

        this.canZoom = true;

        this.dragHandle = {
            src: "css/images/dragIcon.gif",
            width: 11,
            height: 17
        };
        this.zoomOptions = {
            fillStyle: "rgba(0,0,0,0.2)",
            strokeStyle: "#999999",
            lineWidth: 1,
            scrollPercentage: 5
        }

        this.lineOptions = { linePattern: 'dashed', lineWidth: 1, color: '#000000' };

        $.extend(true, this, options);
    };

    $.jqplot.Cursor.cursorLegendFormatString = '%s x:%s, y:%s';

    // called with scope of plot
    $.jqplot.Cursor.init = function (target, data, opts) {
        // add a cursor attribute to the plot
        var options = opts || {};
        this.plugins.cursor = new $.jqplot.Cursor(options.cursor);
        var c = this.plugins.cursor;

        if (c.show) {
            $.jqplot.eventListenerHooks.push(['jqplotMouseEnter', handleMouseEnter]);
            $.jqplot.eventListenerHooks.push(['jqplotMouseLeave', handleMouseLeave]);
            $.jqplot.eventListenerHooks.push(['jqplotMouseMove', handleMouseMove]);

            if (c.showCursorLegend) {
                opts.legend = opts.legend || {};
                opts.legend.renderer = $.jqplot.CursorLegendRenderer;
                opts.legend.formatString = this.plugins.cursor.cursorLegendFormatString;
                opts.legend.show = true;
            }
            if (c.zoom) {
                $.jqplot.eventListenerHooks.push(['jqplotMouseDown', handleMouseDown]);

                if (c.clickReset) {
                    $.jqplot.eventListenerHooks.push(['jqplotClick', handleClick]);
                }

                if (c.dblClickReset) {
                    $.jqplot.eventListenerHooks.push(['jqplotDblClick', handleDblClick]);
                }
            }

            this.resetZoom = function () {
                var axes = this.axes;
                if (!c.zoomProxy) {
                    for (var ax in axes) {
                        axes[ax].reset();
                        axes[ax]._ticks = [];
                        // fake out tick creation algorithm to make sure original auto
                        // computed format string is used if _overrideFormatString is true
                        if (c._zoom.axes[ax] !== undefined) {
                            axes[ax]._autoFormatString = c._zoom.axes[ax].tickFormatString;
                        }
                    }
                    this.redraw();
                }
                else {
                    var ctx = this.plugins.cursor.zoomCanvas._ctx;
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx = null;

                    if (c.zoomRange) {
                        resetDragHandles(this);
                    }
                }
                this.plugins.cursor._zoom.isZoomed = false;
                this.canZoom = true;
                this.target.trigger('jqplotResetZoom', [this, this.plugins.cursor]);
            };


            if (c.showTooltipDataPosition) {
                c.showTooltipUnitPosition = false;
                c.showTooltipGridPosition = false;
                if (options.cursor.tooltipFormatString == undefined) {
                    c.tooltipFormatString = $.jqplot.Cursor.cursorLegendFormatString;
                }
            }

            if ((c.showVerticalLine || c.showHorizontalLine) && c.lineColor) {
                c.shapeRenderer.strokeStyle = c.lineColor;
            }
            c.followMouseValue = c.followMouse;
        }
    };

    $.jqplot.Cursor.unbindMouseDown = function (plot) {
        if (plot.plugins.cursor.zoom) {
            plot.eventCanvas._elem.unbind('jqplotMouseDown', handleMouseDown);
            plot.eventCanvas._elem.unbind('jqplotDblClick', handleDblClick);
            //plot.eventCanvas._elem.unbind('jqplotClick', handleClick);

            var ctx = plot.plugins.cursor.zoomCanvas._ctx;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx = null;
        }

        plot.plugins.cursor.followMouse = false;
        plot.plugins.cursor.showVerticalLine = false;
        // plot.plugins.cursor.showHorizontalLine = false;
        //$($.jqplot.eventListenerHooks).each(function (index, value) { if (value[0] == "jqplotDblClick") console.log(value[0] + ':' + value[1]); });
    }

    $.jqplot.Cursor.bindMouseDown = function (plot) {
        if (plot.plugins.cursor.zoom) {
            plot.eventCanvas._elem.bind('jqplotMouseDown', { plot: plot }, handleMouseDown);
            plot.eventCanvas._elem.bind('jqplotDblClick', handleDblClick);
            //plot.eventCanvas._elem.bind('jqplotClick', { plot: plot }, handleClick);
        }
        plot.plugins.cursor.followMouse = plot.plugins.cursor.followMouseValue;
        plot.plugins.cursor.showVerticalLine = true;
        //  plot.plugins.cursor.showHorizontalLine = true;
    }

    // called with context of plot
    $.jqplot.Cursor.postDraw = function () {
        var c = this.plugins.cursor;

        // Memory Leaks patch
        if (c.zoomCanvas) {
            c.zoomCanvas.resetCanvas();
            c.zoomCanvas = null;
        }

        if (c.cursorCanvas) {
            c.cursorCanvas.resetCanvas();
            c.cursorCanvas = null;
        }

        if (c._tooltipElem) {
            c._tooltipElem.emptyForce();
            c._tooltipElem = null;
        }


        if (c.zoom) {
            c.zoomCanvas = new $.jqplot.GenericCanvas();
            this.eventCanvas._elem.before(c.zoomCanvas.createElement(this._gridPadding, 'jqplot-zoom-canvas', this._plotDimensions, this));
            c.zoomCanvas.setContext();
        }

        var elem = document.createElement('div');
        c._tooltipElem = $(elem);
        elem = null;
        c._tooltipElem.addClass('jqplot-cursor-tooltip');
        c._tooltipElem.css({ position: 'absolute', display: 'none' });


        if (c.zoomCanvas) {
            c.zoomCanvas._elem.before(c._tooltipElem);
        }

        else {
            this.eventCanvas._elem.before(c._tooltipElem);
        }

        if (c.showVerticalLine || c.showHorizontalLine) {
            c.cursorCanvas = new $.jqplot.GenericCanvas();
            this.eventCanvas._elem.before(c.cursorCanvas.createElement(this._gridPadding, 'jqplot-cursor-canvas', this._plotDimensions, this));
            c.cursorCanvas.setContext();
        }

        // if we are showing the positions in unit coordinates, and no axes groups
        // were specified, create a default set.
        if (c.showTooltipUnitPosition) {
            if (c.tooltipAxisGroups.length === 0) {
                var series = this.series;
                var s;
                var temp = [];
                for (var i = 0; i < series.length; i++) {
                    s = series[i];
                    var ax = s.xaxis + ',' + s.yaxis;
                    if ($.inArray(ax, temp) == -1) {
                        temp.push(ax);
                    }
                }
                for (var i = 0; i < temp.length; i++) {
                    c.tooltipAxisGroups.push(temp[i].split(','));
                }
            }
        }
    };

    // Group: methods
    //
    // method: $.jqplot.Cursor.zoomProxy
    // links targetPlot to controllerPlot so that plot zooming of
    // targetPlot will be controlled by zooming on the controllerPlot.
    // controllerPlot will not actually zoom, but acts as an
    // overview plot.  Note, the zoom options must be set to true for
    // zoomProxy to work.
    $.jqplot.Cursor.zoomProxy = function (targetPlot, controllerPlot, useRange, zoomControllerPlot) {
        var tc = targetPlot.plugins.cursor;
        var cc = controllerPlot.plugins.cursor;
        tc.zoomTarget = true;
        tc.zoom = true;
        tc.style = 'auto';
        tc.dblClickReset = false;
        cc.zoom = true;
        cc.zoomProxy = (zoomControllerPlot !== undefined) ? zoomControllerPlot : true;
        cc.zoomRange = useRange || cc.zoomRange;

        if (cc.zoomRange) {

            /* Reposition the zoom proxy such that it sits right under the target */
            var gp = targetPlot._gridPadding;
            //            controllerPlot.target.width(targetPlot._plotDimensions.width - gp.left + 10);
            //                            .css({
            //                                "margin-left": (gp.left - 10) + "px"
            //                            });
            controllerPlot.replot({ resetAxes: false });
            addDragHandles(controllerPlot);
        }

        controllerPlot.target.bind('jqplotZoom', plotZoom);
        controllerPlot.target.bind('jqplotResetZoom', plotReset);

        function plotZoom(ev, gridpos, datapos, plot, cursor) {
            tc.doZoom(gridpos, datapos, targetPlot, cursor);
        }

        function plotReset(ev, plot, cursor) {
            cc._zoom.reset = true;
            targetPlot.resetZoom();
        }

    };

    $.jqplot.Cursor.prototype.resetZoom = function (plot, cursor) {
        var axes = plot.axes;
        var cax = cursor._zoom.axes;
        if (!plot.plugins.cursor.zoomProxy && cursor._zoom.isZoomed) {
            for (var ax in axes) {
                // axes[ax]._ticks = [];
                // axes[ax].min = cax[ax].min;
                // axes[ax].max = cax[ax].max;
                // axes[ax].numberTicks = cax[ax].numberTicks; 
                // axes[ax].tickInterval = cax[ax].tickInterval;
                // // for date axes
                // axes[ax].daTickInterval = cax[ax].daTickInterval;
                axes[ax].reset();
                axes[ax]._ticks = [];
                // fake out tick creation algorithm to make sure original auto
                // computed format string is used if _overrideFormatString is true
                axes[ax]._autoFormatString = cax[ax].tickFormatString;
            }

            plot.redraw();
            cursor._zoom.isZoomed = false;
        }
        else {
            var ctx = cursor.zoomCanvas._ctx;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx = null;

            if (cursor.zoomRange) {
                resetDragHandles(plot);
            }
        }
        plot.plugins.cursor.canZoom = true;
        plot.target.trigger('jqplotResetZoom', [plot, cursor]);
    };

    $.jqplot.Cursor.resetZoom = function (plot) {
        plot.resetZoom();
        this.canZoom = true;
    };

    $.jqplot.Cursor.prototype.doZoom = function (gridpos, datapos, plot, cursor) {
        var c = cursor;
        var axes = plot.axes;
        var zaxes = c._zoom.axes;
        var start = zaxes.start;
        var end = zaxes.end;
        var min, max, dp, span,
            newmin, newmax, curax, _numberTicks, ret;
        var ctx = plot.plugins.cursor.zoomCanvas._ctx;
        // don't zoom if zoom area is too small (in pixels)
        var st = Math.max(Math.min(parseInt(start.xaxis), parseInt(datapos.xaxis)), 0);
        var en = Math.max(parseInt(start.xaxis), parseInt(datapos.xaxis));

        if ((this.canZoom && (en - st > this.minZoom)) && ((c.constrainZoomTo == 'none' && Math.abs(gridpos.x - c._zoom.start[0]) > 6 && Math.abs(gridpos.y - c._zoom.start[1]) > 6) || (c.constrainZoomTo == 'x' && Math.abs(gridpos.x - c._zoom.start[0]) > 6) || (c.constrainZoomTo == 'y' && Math.abs(gridpos.y - c._zoom.start[1]) > 6))) {
            if (!plot.plugins.cursor.zoomProxy) {
                for (var ax in axes) {
                    // make a copy of the original axes to revert back.
                    if (c._zoom.axes[ax] == undefined) {
                        c._zoom.axes[ax] = {};
                        c._zoom.axes[ax].numberTicks = axes[ax].numberTicks;
                        c._zoom.axes[ax].tickInterval = axes[ax].tickInterval;
                        // for date axes...
                        c._zoom.axes[ax].daTickInterval = axes[ax].daTickInterval;
                        c._zoom.axes[ax].min = axes[ax].min;
                        c._zoom.axes[ax].max = axes[ax].max;
                        c._zoom.axes[ax].tickFormatString = (axes[ax].tickOptions != null) ? axes[ax].tickOptions.formatString : '';

                    }

                    if ((c.constrainZoomTo == 'none') || (c.constrainZoomTo == 'x' && ax.charAt(0) == 'x') || (c.constrainZoomTo == 'y' && ax.charAt(0) == 'y')) {
                        dp = datapos[ax];
                        if (dp != null) {
                            if (dp > start[ax]) {
                                newmin = start[ax];
                                newmax = dp;
                            }
                            else {
                                span = start[ax] - dp;
                                newmin = dp;
                                newmax = start[ax];
                            }

                            curax = axes[ax];
                            _numberTicks = null;

                            // if aligning this axis, use number of ticks from previous axis.
                            // Do I need to reset somehow if alignTicks is changed and then graph is replotted??
                            if (curax.alignTicks) {
                                if (curax.name === 'x2axis' && plot.axes.xaxis.show) {
                                    _numberTicks = plot.axes.xaxis.numberTicks;
                                }
                                else if (curax.name.charAt(0) === 'y' && curax.name !== 'yaxis' && curax.name !== 'yMidAxis' && plot.axes.yaxis.show) {
                                    _numberTicks = plot.axes.yaxis.numberTicks;
                                }
                            }

                            if (this.looseZoom && (axes[ax].renderer.constructor === $.jqplot.LinearAxisRenderer || axes[ax].renderer.constructor === $.jqplot.LogAxisRenderer)) { //} || axes[ax].renderer.constructor === $.jqplot.DateAxisRenderer)) {

                                ret = $.jqplot.LinearTickGenerator(newmin, newmax, curax._scalefact, _numberTicks);

                                // if new minimum is less than "true" minimum of axis display, adjust it
                                if (axes[ax].tickInset && ret[0] < axes[ax].min + axes[ax].tickInset * axes[ax].tickInterval) {
                                    ret[0] += ret[4];
                                    ret[2] -= 1;
                                }

                                // if new maximum is greater than "true" max of axis display, adjust it
                                if (axes[ax].tickInset && ret[1] > axes[ax].max - axes[ax].tickInset * axes[ax].tickInterval) {
                                    ret[1] -= ret[4];
                                    ret[2] -= 1;
                                }

                                // for log axes, don't fall below current minimum, this will look bad and can't have 0 in range anyway.
                                if (axes[ax].renderer.constructor === $.jqplot.LogAxisRenderer && ret[0] < axes[ax].min) {
                                    // remove a tick and shift min up
                                    ret[0] += ret[4];
                                    ret[2] -= 1;
                                }

                                axes[ax].min = ret[0];
                                axes[ax].max = ret[1];
                                axes[ax]._autoFormatString = ret[3];
                                axes[ax].numberTicks = ret[2];
                                axes[ax].tickInterval = ret[4];
                                // for date axes...
                                axes[ax].daTickInterval = [ret[4] / 1000, 'seconds'];
                            }
                            else {
                                axes[ax].min = newmin;
                                axes[ax].max = newmax;
                                axes[ax].tickInterval = null;
                                axes[ax].numberTicks = null;
                                // for date axes...
                                axes[ax].daTickInterval = null;
                            }

                            axes[ax]._ticks = [];
                        }
                    }
                    if (c.constrainZoomTo == 'x' && ax.charAt(0) == 'x') {
                        axes[ax].numberTicks = null;
                        axes[ax].tickInterval = null;
                        st = (st > plot.series[0]._plotData.length) ? (plot.series[0]._plotData.length - (en - st)) : st;
                        axes[ax].min = plot.series[0]._plotData[st][0];
                    }
                    if (c.constrainZoomTo == 'x' && ax.charAt(0) == 'y' && (en - st) >= 2) {
                        var multipleSeriesOnAxis = 0;
                        // scale axis

                        for (var i = 0; i < plot.series.length; i++) {
                            var s = plot.series[i];
                            var faname = s.yaxis;

                            // check to see if this is the fill axis
                            if (ax == faname && st < s._plotData.length) {
                                multipleSeriesOnAxis++;
                                var vals = s._plotData;
                                var end = Math.min(en, vals.length - 1);
                                var vmin = (axes[ax].forceMin0) ? 0 : getMinY(vals[st]);
                                var vmax = getMaxY(vals[st]);

                                for (var j = 0; j <= end; j++) {
                                    if (vals[j][0] > st) {
                                        var min = getMinY(vals[j]);
                                        var max = getMaxY(vals[j]);
                                        if (min < vmin) {
                                            vmin = min;
                                        }
                                        else if (max > vmax) {
                                            vmax = max;
                                        }
                                    }
                                }
                                if (multipleSeriesOnAxis > 1) {
                                    vmax = Math.max(axes[ax].max, vmax);
                                    vmin = Math.min(axes[ax].min, vmin);
                                }

                                var range = Math.abs((vmax - vmin));

                                var rmin = (axes[ax].forceMin0) ? 0 : vmin - range * (axes[ax].padMin - 1);
                                var rmax = vmax + range * (axes[ax].padMax - 1);
                                var range = Math.abs((rmax - rmin));

                                if (axes[ax].numberTicks == null) {
                                    if (axes[ax].tickInterval) {
                                        axes[ax].numberTicks = Math.ceil(range / axes[ax].tickInterval);
                                    }
                                    else {
                                        axes[ax].numberTicks = 3;
                                    }
                                }
                                axes[ax].tickInterval = range / (axes[ax].numberTicks - 1);
                                axes[ax].max = rmax;
                                axes[ax].min = rmin;

                                vals = vmin = vmax = rmin = rmax = null;
                            }
                            s = null;
                        }

                        //----------------------------------------------------
                    }
                }
                if (ctx.canvas) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                }

                plot.redraw();
                c._zoom.isZoomed = true;
                ctx = null;
            }
            this.canZoom = ((en - st) > this.minZoom);
            plot.target.trigger('jqplotZoom', [gridpos, datapos, plot, cursor]);
        }
        else {
            if ((en - st) < this.minZoom && !plot.plugins.cursor.zoomProxy) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                // plot.redraw();
            }
        }
        c = axes = zaxes = start = end = ctx = null;
    };

    function getMinY(array) {
        if (array !== undefined && array.length > 1) {
            var min = array[1];
            for (var i = 2; i < 4; i++) {
                if (array[i] < min)
                    min = array[i];
            }
            return min;
        }
        return null;
    }

    function getMaxY(array) {
        if (array !== undefined && array.length > 1) {
            var max = array[1];
            for (var i = 2; i < 4; i++) {
                if (array[i] > max)
                    max = array[i];
            }
            return max;
        }
        return null;
    }

    $.jqplot.preInitHooks.push($.jqplot.Cursor.init);
    $.jqplot.postDrawHooks.push($.jqplot.Cursor.postDraw);

    function updateTooltip(gridpos, datapos, plot) {
        var c = plot.plugins.cursor;
        var s = '';
        var addbr = false;
        if (c.showTooltipGridPosition) {
            s = gridpos.x + ', ' + gridpos.y;
            addbr = true;
        }
        if (c.showTooltipUnitPosition) {
            var g;
            for (var i = 0; i < c.tooltipAxisGroups.length; i++) {
                g = c.tooltipAxisGroups[i];
                if (addbr) {
                    s += '<br />';
                }
                if (c.useAxesFormatters) {
                    var xf = plot.axes[g[0]]._ticks[0].formatter;
                    var yf = plot.axes[g[1]]._ticks[0].formatter;
                    var xfstr = plot.axes[g[0]]._ticks[0].formatString;
                    var yfstr = plot.axes[g[1]]._ticks[0].formatString;
                    s += xf(xfstr, datapos[g[0]]) + ', ' + yf(yfstr, datapos[g[1]]);
                }
                else {
                    s += $.jqplot.sprintf(c.tooltipFormatString, datapos[g[0]], datapos[g[1]]);
                }
                addbr = true;
            }
        }

        if (c.showTooltipDataPosition) {
            var series = plot.series;
            var ret = getIntersectingPoints(plot, gridpos.x, gridpos.y);
            var addbr = false;

            for (var i = 0; i < series.length; i++) {
                if (series[i].show) {
                    var idx = series[i].index;
                    var label = series[i].label.toString();
                    var cellid = $.inArray(idx, ret.indices);
                    var sx = undefined;
                    var sy = undefined;
                    if (cellid != -1) {
                        var data = ret.data[cellid].data;
                        if (c.useAxesFormatters) {
                            var xf = series[i]._xaxis._ticks[0].formatter;
                            var yf = series[i]._yaxis._ticks[0].formatter;
                            var xfstr = series[i]._xaxis._ticks[0].formatString;
                            var yfstr = series[i]._yaxis._ticks[0].formatString;
                            sx = xf(xfstr, data[0]);
                            sy = yf(yfstr, data[1]);
                        }
                        else {
                            sx = data[0];
                            sy = data[1];
                        }
                        if (addbr) {
                            s += '<br />';
                        }
                        s += $.jqplot.sprintf(c.tooltipFormatString, label, sx, sy);
                        addbr = true;
                    }
                }
            }

        }
        c._tooltipElem.html(s);
    }

    function addDragHandles(plot) {
        var handle = plot.plugins.cursor.dragHandle;
        var position = plot.target.position();
        var padding = plot._gridPadding;
        var eventCanvas = plot.eventCanvas._elem;

        // Resize the event canvas so that the handles are included
        eventCanvas.css({
            left: (eventCanvas.position().left - (handle.width / 2)) + "px",
            width: (eventCanvas.width() + handle.width) + "px"
        });

        var size = { width: eventCanvas.outerWidth(), height: eventCanvas.outerHeight() };

        //
        var l = {
            x: (padding.left - (handle.width / 2)),
            y: padding.top + (size.height / 2) - (handle.height / 2)
        };
        var r = {
            x: l.x + size.width - handle.width,
            y: l.y
        };

        eventCanvas.before(
            $("<img>", { src: handle.src, "class": "jqplot-handle jqplot-handle-left", "top": l.y, "left": l.x }),
            $("<img>", { src: handle.src, "class": "jqplot-handle jqplot-handle-right", "top": r.y, "left": r.x })
        );

        resetDragHandles(plot);
    }

    function resetDragHandles(plot, single) {
        var lh = $(".jqplot-handle-left", plot.target);
        var rh = $(".jqplot-handle-right", plot.target);

        if (!single || single == "left") {
            lh.css({
                position: "absolute",
                top: lh.attr("top") + "px",
                left: lh.attr("left") + "px"
            });
        }

        if (!single || single == "right") {
            rh.css({
                position: "absolute",
                top: rh.attr("top") + "px",
                left: rh.attr("left") + "px"
            });
        }
    }

    function moveLine(gridpos, plot) {
        var c = plot.plugins.cursor;
        var ctx = c.cursorCanvas._ctx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var ret = getIntersectingPoints(plot, gridpos.x, gridpos.y);
        if (c.showVerticalLine) {
            //c.shapeRenderer.draw(ctx, [[gridpos.x, 0], [gridpos.x, ctx.canvas.height]]); { linePattern: 'dashed', lineWidth: 1, color: '#000000' }
            gridpos.x = plot.axes.xaxis.series_u2p(Math.round(plot.axes.xaxis.series_p2u(gridpos.x)));
            c.shapeRenderer.draw(ctx, [[gridpos.x, 0], [gridpos.x, ctx.canvas.height]], c.lineOptions);

        }
        if (c.showHorizontalLine) {
            //c.shapeRenderer.draw(ctx, [[0, gridpos.y], [ctx.canvas.width, gridpos.y]]);
            c.shapeRenderer.draw(ctx, [[0, gridpos.y], [ctx.canvas.width, gridpos.y]], c.lineOptions);
        }

        if (c.highlight && plot.plugins.highlighter) {
            for (var i = 0, l = plot.series.length; i < l; i++) {
                var idx = $.inArray(i, ret.indices);
                if (idx != -1) {
                    var data = ret.data[i];
                    $.jqplot.Highlighter.highlight(plot, plot.series[i], data);
                }
            }
        }

        if (c.showCursorLegend) {
            var cells = $(plot.targetId + ' td.jqplot-cursor-legend-label');
            for (var i = 0; i < cells.length; i++) {
                var idx = $(cells[i]).data('seriesIndex');
                var series = plot.series[idx];
                var label = series.label.toString();
                var cellid = $.inArray(idx, ret.indices);
                var sx = undefined;
                var sy = undefined;
                if (cellid != -1) {
                    var data = ret.data[cellid].data;
                    if (c.useAxesFormatters) {
                        var xf = series._xaxis._ticks[0].formatter;
                        var yf = series._yaxis._ticks[0].formatter;
                        var xfstr = series._xaxis._ticks[0].formatString;
                        var yfstr = series._yaxis._ticks[0].formatString;
                        sx = xf(xfstr, data[0]);
                        sy = yf(yfstr, data[1]);
                    }
                    else {
                        sx = data[0];
                        sy = data[1];
                    }
                }
                if (c.cursorLegendFormatter) {
                    var clf = c.cursorLegendFormatter;
                    clf.xaxis = clf.xaxis || {};
                    clf.yaxis = clf.yaxis || {};

                    clf.xaxis.formatter = clf.xaxis.formatter || (c.useAxesFormatters ? series._xaxis._ticks[0].formatter : function (s) { return s; });
                    clf.yaxis.formatter = clf.yaxis.formatter || (c.useAxesFormatters ? series._yaxis._ticks[0].formatter : function (s) { return s; });
                    clf.xaxis.formatString = clf.xaxis.formatString || (c.useAxesFormatters ? series._xaxis._ticks[0].formatString : "");
                    clf.yaxis.formatString = clf.yaxis.formatString || (c.useAxesFormatters ? series._yaxis._ticks[0].formatString : "");

                    $(cells[i]).html(c.cursorLegendFormatter.formatter(c.cursorLegendFormatter, label, sx, sy));

                } else {
                    if (plot.legend.escapeHtml) {
                        $(cells[i]).text($.jqplot.sprintf(c.cursorLegendFormatString, label, sx, sy));
                    }
                    else {
                        $(cells[i]).html($.jqplot.sprintf(c.cursorLegendFormatString, label, sx, sy));
                    }
                }
            }
        }
        ctx = null;
    }

    function getIntersectingPoints(plot, x, y) {
        var ret = { indices: [], data: [] };
        var s, i, d0, d, j, r, p;
        var threshold;
        var c = plot.plugins.cursor;
        for (var i = 0; i < plot.series.length; i++) {
            s = plot.series[i];
            r = s.renderer;
            if (s.show) {
                threshold = c.intersectionThreshold;
                if (s.showMarker) {
                    threshold += s.markerRenderer.size / 2;
                }
                for (var j = 0; j < s.gridData.length; j++) {
                    p = s.gridData[j];
                    // check vertical line
                    if (c.showVerticalLine) {
                        if (Math.abs(x - p[0]) <= threshold) {
                            ret.indices.push(i);
                            ret.data.push({ seriesIndex: i, pointIndex: j, gridData: p, intersectGrid: { x: x, y: y }, data: s.data[j] });
                        }
                    }
                }
            }
        }
        return ret;
    }

    function moveTooltip(gridpos, plot, elem, location) {
        var c = plot.plugins.cursor;
        elem = elem || c._tooltipElem;
        switch (location || c.tooltipLocation) {
            case 'nw':
                var x = gridpos.x + plot._gridPadding.left - elem.outerWidth(true) - c.tooltipOffset;
                var y = gridpos.y + plot._gridPadding.top - c.tooltipOffset - elem.outerHeight(true);
                break;
            case 'n':
                var x = gridpos.x + plot._gridPadding.left - elem.outerWidth(true) / 2;
                var y = gridpos.y + plot._gridPadding.top - c.tooltipOffset - elem.outerHeight(true);
                break;
            case 'ne':
                var x = gridpos.x + plot._gridPadding.left + c.tooltipOffset;
                var y = gridpos.y + plot._gridPadding.top - c.tooltipOffset - elem.outerHeight(true);
                break;
            case 'e':
                var x = gridpos.x + plot._gridPadding.left + c.tooltipOffset;
                var y = gridpos.y + plot._gridPadding.top - elem.outerHeight(true) / 2;
                break;
            case 'se':
                var x = gridpos.x + plot._gridPadding.left + c.tooltipOffset;
                var y = gridpos.y + plot._gridPadding.top + c.tooltipOffset;
                break;
            case 's':
                var x = gridpos.x + plot._gridPadding.left - elem.outerWidth(true) / 2;
                var y = gridpos.y + plot._gridPadding.top + c.tooltipOffset;
                break;
            case 'sw':
                var x = gridpos.x + plot._gridPadding.left - elem.outerWidth(true) - c.tooltipOffset;
                var y = gridpos.y + plot._gridPadding.top + c.tooltipOffset;
                break;
            case 'w':
                var x = gridpos.x + plot._gridPadding.left - elem.outerWidth(true) - c.tooltipOffset;
                var y = gridpos.y + plot._gridPadding.top - elem.outerHeight(true) / 2;
                break;
            case 'x':
                var x = gridpos.x + plot._gridPadding.left - elem.outerWidth() / 2;
                var y = elem.css("top");
                break;
            case 'y':
                var x = elem.css("left");
                var y = gridpos.y + plot._gridPadding.top - elem.outerHeight() / 2;
            default:
                var x = gridpos.x + plot._gridPadding.left + c.tooltipOffset;
                var y = gridpos.y + plot._gridPadding.top + c.tooltipOffset;
                break;
        }

        elem.css('left', x);
        elem.css('top', y);
        elem = null;
    }

    function positionTooltip(plot) {
        // fake a grid for positioning
        var grid = plot._gridPadding;
        var c = plot.plugins.cursor;
        var elem = c._tooltipElem;
        switch (c.tooltipLocation) {
            case 'nw':
                var a = grid.left + c.tooltipOffset;
                var b = grid.top + c.tooltipOffset;
                elem.css('left', a);
                elem.css('top', b);
                break;
            case 'n':
                var a = (grid.left + (plot._plotDimensions.width - grid.right)) / 2 - elem.outerWidth(true) / 2;
                var b = grid.top + c.tooltipOffset;
                elem.css('left', a);
                elem.css('top', b);
                break;
            case 'ne':
                var a = grid.right + c.tooltipOffset;
                var b = grid.top + c.tooltipOffset;
                elem.css({ right: a, top: b });
                break;
            case 'e':
                var a = grid.right + c.tooltipOffset;
                var b = (grid.top + (plot._plotDimensions.height - grid.bottom)) / 2 - elem.outerHeight(true) / 2;
                elem.css({ right: a, top: b });
                break;
            case 'se':
                var a = grid.right + c.tooltipOffset;
                var b = grid.bottom + c.tooltipOffset;
                elem.css({ right: a, bottom: b });
                break;
            case 's':
                var a = (grid.left + (plot._plotDimensions.width - grid.right)) / 2 - elem.outerWidth(true) / 2;
                var b = grid.bottom + c.tooltipOffset;
                elem.css({ left: a, bottom: b });
                break;
            case 'sw':
                var a = grid.left + c.tooltipOffset;
                var b = grid.bottom + c.tooltipOffset;
                elem.css({ left: a, bottom: b });
                break;
            case 'w':
                var a = grid.left + c.tooltipOffset;
                var b = (grid.top + (plot._plotDimensions.height - grid.bottom)) / 2 - elem.outerHeight(true) / 2;
                elem.css({ left: a, top: b });
                break;
            default:  // same as 'se'
                var a = grid.right - c.tooltipOffset;
                var b = grid.bottom + c.tooltipOffset;
                elem.css({ right: a, bottom: b });
                break;
        }
        elem = null;
    }

    function handleClick(ev, gridpos, datapos, neighbor, plot) {
        //        ev.preventDefault();
        //        ev.stopImmediatePropagation();
        //        var c = plot.plugins.cursor;
        //        if (c.clickReset) {
        //            c.resetZoom(plot, c);
        //        }
        //        var sel = window.getSelection;
        //        if (document.selection && document.selection.empty) {
        //            document.selection.empty();
        //        }
        //        else if (sel && !sel().isCollapsed) {
        //            sel().collapse();
        //        }
        //        return false;
        return;
    }

    function handleDblClick(ev, gridpos, datapos, neighbor, plot) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        var c = plot.plugins.cursor;
        if (c.dblClickReset) {
            c.resetZoom(plot, c);
        }

        var sel = window.getSelection;
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        }
        else if (sel && !sel().isCollapsed) {
            sel().collapse();
        }
        return false;
    }

    function handleMouseLeave(ev, gridpos, datapos, neighbor, plot) {
        var c = plot.plugins.cursor;
        c.onGrid = false;
        if (c.show) {
            $(ev.target).css('cursor', c.previousCursor);
            if (c.showTooltip && !(c._zoom.zooming && c.showTooltipOutsideZoom && !c.constrainOutsideZoom)) {
                c._tooltipElem.hide();
            }
            if (c.zoom) {
                c._zoom.gridpos = gridpos;
                c._zoom.datapos = datapos;
            }
            if (c.showVerticalLine || c.showHorizontalLine) {
                var ctx = c.cursorCanvas._ctx;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx = null;
            }
            if (c.showCursorLegend) {
                var cells = $(plot.targetId + ' td.jqplot-cursor-legend-label');
                for (var i = 0; i < cells.length; i++) {
                    var idx = $(cells[i]).data('seriesIndex');
                    var series = plot.series[idx];
                    var label = series.label.toString();

                    var sx = "", sy = "";

                    if (c.cursorLegendFormatter) {
                        var clf = c.cursorLegendFormatter;
                        clf.xaxis = clf.xaxis || {};
                        clf.yaxis = clf.yaxis || {};

                        clf.xaxis.formatter = clf.xaxis.formatter || (c.useAxesFormatters ? series._xaxis._ticks[0].formatter : function (s) { return s; });
                        clf.yaxis.formatter = clf.yaxis.formatter || (c.useAxesFormatters ? series._yaxis._ticks[0].formatter : function (s) { return s; });
                        clf.xaxis.formatString = clf.xaxis.formatString || (c.useAxesFormatters ? series._xaxis._ticks[0].formatString : "");
                        clf.yaxis.formatString = clf.yaxis.formatString || (c.useAxesFormatters ? series._yaxis._ticks[0].formatString : "");

                        $(cells[i]).html(c.cursorLegendFormatter.formatter(c.cursorLegendFormatter, label, sx, sy));

                    } else {
                        if (plot.legend.escapeHtml) {
                            $(cells[i]).text($.jqplot.sprintf(c.cursorLegendFormatString, label, sx, sy));
                        }
                        else {
                            $(cells[i]).html($.jqplot.sprintf(c.cursorLegendFormatString, label, sx, sy));
                        }
                    }
                }
            }
        }
    }

    function handleMouseEnter(ev, gridpos, datapos, neighbor, plot) {
        var c = plot.plugins.cursor;
        c.onGrid = true;
        if (c.show) {
            c.previousCursor = ev.target.style.cursor;
            ev.target.style.cursor = c.style;
            if (c.showTooltip) {
                updateTooltip(gridpos, datapos, plot);
                if (c.followMouse) {
                    moveTooltip(gridpos, plot);
                }
                else {
                    positionTooltip(plot);
                }
                c._tooltipElem.show();
            }
            if (c.showVerticalLine || c.showHorizontalLine) {
                moveLine(gridpos, plot);
            }
        }

    }

    function handleMouseMove(ev, gridpos, datapos, neighbor, plot) {
        var c = plot.plugins.cursor;
        if (c.show) {
            if (c.showTooltip) {
                updateTooltip(gridpos, datapos, plot);
                if (c.followMouse) {
                    moveTooltip(gridpos, plot);
                }
            }
            if (c.showVerticalLine || c.showHorizontalLine) {
                moveLine(gridpos, plot);
            }
        }
    }

    function gridPositionToDataPosition(gridPos, plot) {
        //////
        // TO DO: handle yMidAxis
        //////
        var dataPos = { xaxis: null, yaxis: null, x2axis: null, y2axis: null, y3axis: null, y4axis: null, y5axis: null, y6axis: null, y7axis: null, y8axis: null, y9axis: null, yMidAxis: null };
        var an = ['xaxis', 'yaxis', 'x2axis', 'y2axis', 'y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis', 'yMidAxis'];
        var ax = plot.axes;
        var n, axis;
        for (n = 11; n > 0; n--) {
            axis = an[n - 1];
            if (ax[axis].show) {
                dataPos[axis] = ax[axis].series_p2u(gridPos[axis.charAt(0)]);
            }
        }
        return dataPos;
    }

    function getEventPosition(ev) {
        var plot = ev.data.plot;
        var go = plot.eventCanvas._elem.offset();
        var gm = { width: plot.eventCanvas._elem.width(), height: plot.eventCanvas._elem.height() };

        // compensate for handles extending beyond the edges of the normal grid
        if (plot.plugins.cursor.zoomRange) {
            var handle = plot.plugins.cursor.dragHandle;
            go.left += handle.width / 2;
        }

        var gridPos = { x: ev.pageX - go.left, y: ev.pageY - go.top };

        // handles beyond the edge of the normal grid
        if (plot.plugins.cursor.zoomRange) {
            if (gridPos.x > gm.width - handle.width) {
                gridPos.x = gm.width - handle.width;
            }
        }

        var dataPos = gridPositionToDataPosition(gridPos, plot);

        return { offsets: go, gridPos: gridPos, dataPos: dataPos };
    }

    function getDragHandleSide(plot, gridpos) {

        var go = $(".jqplot-event-canvas", plot.target).position();

        var left = getDragHandlePosition("left", plot).x;
        var right = getDragHandlePosition("right", plot).x;

        var isLeft = (gridpos.x < left + plot.plugins.cursor.dragHandle.width && gridpos.x >= left);
        var isRight = (gridpos.x < right + plot.plugins.cursor.dragHandle.width && gridpos.x >= right);

        if (isLeft) return "left";
        if (isRight) return "right";

        return "scroll";
    }

    function getDragHandlePosition(handle, plot) {
        var go = $(".jqplot-event-canvas", plot.target).position();
        var pos = $(".jqplot-handle-" + handle, plot.target).position();

        return { x: pos.left - go.left, y: pos.top - go.top };
    }

    function handleZoomScroll(ev) {
        var plot = ev.data.plot;
        var c = plot.plugins.cursor;
        var ctx = c.zoomCanvas._ctx;
        var positions = getEventPosition(ev);
        var gridpos = positions.gridPos;
        var datapos = positions.dataPos;

        if (c.zoomRange && c._zoom.scrolling) {
            var handle = c._zoom.handle;

            if (handle == "scroll") {
                var leftHandle = $(".jqplot-handle-left", plot.target);
                var rightHandle = $(".jqplot-handle-right", plot.target);

                var handleOffset = c.dragHandle / 2;
                var adjustment = gridpos.x - c._zoom.scrollHandle.x;
                var zoomAdjust = gridpos.x - c._zoom.scrollHandle.zoomX;

                c._zoom.scrollHandle.x = gridpos.x;

                var height = ctx.canvas.height;
                var width = ctx.canvas.width;

                // Can't scroll past edges
                if (c._zoom.rightHandle.x + adjustment <= 0
                    || c._zoom.leftHandle.x + adjustment <= 0
                    || c._zoom.rightHandle.x + adjustment >= width
                    || c._zoom.leftHandle.x + adjustment >= width
                ) {
                    c._zoom.scrollHandle.x = gridpos.x;
                    c._zoom.scrollHandle.zoomX = gridpos.x;
                    return;
                }

                moveTooltip({ x: c._zoom.leftHandle.x + adjustment, y: c._zoom.leftHandle.y }, plot, leftHandle, "x");
                moveTooltip({ x: c._zoom.rightHandle.x + adjustment, y: c._zoom.rightHandle.y }, plot, rightHandle, "x");
                c._zoom.leftHandle = getDragHandlePosition("left", plot);
                c._zoom.rightHandle = getDragHandlePosition("right", plot);

                setZoomStart(c._zoom.leftHandle, null, plot);
                setZoomEnd(c._zoom.rightHandle, null, plot);

                if ((Math.abs(zoomAdjust) / width) > (c.zoomOptions.scrollPercentage / 100)) {
                    c._zoom.scrollHandle.zoomX = gridpos.x;
                    doZoom(plot);
                }

                return;
            }
        }
    }

    function handleZoomMove(ev) {
        var plot = ev.data.plot;
        var c = plot.plugins.cursor;
        // don't do anything if not on grid.
        if (c.show && c.zoom && c._zoom.started && !c.zoomTarget) {
            var positions = getEventPosition(ev);
            var gridpos = positions.gridPos;
            var datapos = positions.dataPos;

            c._zoom.zooming = true;

            setZoomEnd(gridpos, datapos, plot);

            if (c.zoomRange) {
                var handle = c._zoom.handle; //;
                var dragHandle = $(".jqplot-handle-" + handle, plot.target);

                if (gridpos.x >= 0) {
                    moveTooltip(gridpos, plot, dragHandle, "x");
                }
            }
            var sel = window.getSelection;
            if (document.selection && document.selection.empty) {
                document.selection.empty();
            }
            else if (sel && !sel().isCollapsed) {
                //sel().collapse();
                sel().collapse(sel().anchorNode, sel().anchorOffset);
            }
        }
    }

    function setZoomStart(gridpos, datapos, plot) {
        var c = plot.plugins.cursor;

        c._zoom.gridpos = gridpos;
        c._zoom.datapos = datapos = datapos || gridPositionToDataPosition(gridpos, plot);

        var axes = plot.axes;

        if (!c.zoomProxy) {
            var ctx = c.zoomCanvas._ctx;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx = null;
        }
        if (c.constrainZoomTo == 'x') {
            c._zoom.start = [gridpos.x, 0];
        }
        else if (c.constrainZoomTo == 'y') {
            c._zoom.start = [0, gridpos.y];
        }
        else {
            c._zoom.start = [gridpos.x, gridpos.y];
        }
        c._zoom.started = true;
        for (var ax in datapos) {
            // get zoom starting position.
            c._zoom.axes.start[ax] = datapos[ax];
        }
    }

    function setZoomEnd(gridpos, datapos, plot) {
        var c = plot.plugins.cursor;
        var ctx = c.zoomCanvas._ctx;
        c._zoom.gridpos = gridpos;
        c._zoom.datapos = datapos;

        c._zoom.datapos = datapos = datapos || gridPositionToDataPosition(gridpos, plot);

        var xpos = gridpos.x;
        var ypos = gridpos.y;

        var height = ctx.canvas.height;
        var width = ctx.canvas.width;

        if (c.showTooltip && !c.onGrid && c.showTooltipOutsideZoom) {
            updateTooltip(gridpos, datapos, plot);
            if (c.followMouse) {
                moveTooltip(gridpos, plot);
            }
        }
        if (c.constrainZoomTo == 'x') {
            c._zoom.end = [xpos, height];
        }
        else if (c.constrainZoomTo == 'y') {
            c._zoom.end = [width, ypos];
        }
        else {
            c._zoom.end = [xpos, ypos];
        }
        drawZoomBox.call(c);
        ctx = null;
    }

    function doZoom(plot) {
        var c = plot.plugins.cursor;
        var xpos = c._zoom.gridpos.x;
        var ypos = c._zoom.gridpos.y;
        var datapos = c._zoom.datapos;
        var height = c.zoomCanvas._ctx.canvas.height;
        var width = c.zoomCanvas._ctx.canvas.width;
        var axes = plot.axes;

        if (c.constrainOutsideZoom && !c.onGrid) {
            if (xpos < 0) { xpos = 0; }
            else if (xpos > width) { xpos = width; }
            if (ypos < 0) { ypos = 0; }
            else if (ypos > height) { ypos = height; }

            for (var axis in datapos) {
                if (datapos[axis]) {
                    if (axis.charAt(0) == 'x') {
                        datapos[axis] = axes[axis].series_p2u(xpos);
                    }
                    else {
                        datapos[axis] = axes[axis].series_p2u(ypos);
                    }
                }
            }
        }

        if (c.constrainZoomTo == 'x') {
            ypos = height;
        }
        else if (c.constrainZoomTo == 'y') {
            xpos = width;
        }
        c._zoom.end = [xpos, ypos];
        c._zoom.gridpos = { x: xpos, y: ypos };

        c.doZoom(c._zoom.gridpos, datapos, plot, c);
    }

    function handleMouseDown(ev, gridpos, datapos, neighbor, plot) {
        var c = plot.plugins.cursor;
        if (c.zoomRange) {
            var handle = c._zoom.handle = getDragHandleSide(plot, gridpos);
            if (handle != "scroll") {
                c._zoom.reset = false;
                plot.eventCanvas._elem.css("cursor", "col-resize");
                setZoomStart(getDragHandlePosition(c._zoom.handle == "right" ? "left" : "right", plot), null, plot);
            } else {
                plot.eventCanvas._elem.css("cursor", "move");
                c._zoom.leftHandle = getDragHandlePosition("left", plot);
                c._zoom.rightHandle = getDragHandlePosition("right", plot);
                c._zoom.scrollHandle = gridpos;
                c._zoom.scrollHandle.zoomX = gridpos.x;
                c._zoom.scrolling = true;
                $(document).bind('mousemove.jqplotCursor', { plot: plot }, handleZoomScroll);
                $(document).one('mouseup.jqplot_cursor', { plot: plot }, handleMouseUp);

                return;
            }
        } else {
            setZoomStart(gridpos, datapos, plot);
        }

        $(document).one('mouseup.jqplot_cursor', { plot: plot }, handleMouseUp);

        if (document.onselectstart != undefined) {
            c._oldHandlers.onselectstart = document.onselectstart;
            document.onselectstart = function () { return false; };
        }
        if (document.ondrag != undefined) {
            c._oldHandlers.ondrag = document.ondrag;
            document.ondrag = function () { return false; };
        }
        if (document.onmousedown != undefined) {
            c._oldHandlers.onmousedown = document.onmousedown;
            document.onmousedown = function () { return false; };
        }
        if (c.zoom) {
            $(document).bind('mousemove.jqplotCursor', { plot: plot }, handleZoomMove);
        }
    }

    function handleMouseUpScroll(ev) {
        var plot = ev.data.plot;
        var c = plot.plugins.cursor;
        c._zoom.scrolling = false;
    }

    function handleMouseUp(ev) {
        var plot = ev.data.plot;
        var c = plot.plugins.cursor;

        if (c.zoomRange) {
            plot.eventCanvas._elem.css("cursor", "pointer");
        }
        if (c.zoom && (c._zoom.zooming || c._zoom.scrolling) && !c.zoomTarget && (!c.zoomRange || (c.zoomRange && !c._zoom.reset))) {
            doZoom(plot);
        }
        c._zoom.started = false;
        c._zoom.zooming = false;
        c._zoom.scrolling = false;

        $(document).unbind('mousemove.jqplotCursor', handleZoomMove);
        $(document).unbind('mousemove.jqplotCursor', handleZoomScroll);

        if (document.onselectstart != undefined && c._oldHandlers.onselectstart != null) {
            document.onselectstart = c._oldHandlers.onselectstart;
            c._oldHandlers.onselectstart = null;
        }
        if (document.ondrag != undefined && c._oldHandlers.ondrag != null) {
            document.ondrag = c._oldHandlers.ondrag;
            c._oldHandlers.ondrag = null;
        }
        if (document.onmousedown != undefined && c._oldHandlers.onmousedown != null) {
            document.onmousedown = c._oldHandlers.onmousedown;
            c._oldHandlers.onmousedown = null;
        }
    }

    function drawZoomBox() {
        var start = this._zoom.start;
        var end = this._zoom.end;
        var ctx = this.zoomCanvas._ctx;
        var l, t, h, w;
        if (end[0] > start[0]) {
            l = start[0];
            w = end[0] - start[0];
        }
        else {
            l = end[0];
            w = start[0] - end[0];
        }
        if (end[1] > start[1]) {
            t = start[1];
            h = end[1] - start[1];
        }
        else {
            t = end[1];
            h = start[1] - end[1];
        }
        ctx.fillStyle = this.zoomOptions.fillStyle;
        ctx.strokeStyle = this.zoomOptions.strokeStyle;
        ctx.lineWidth = this.zoomOptions.lineWidth;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.clearRect(l, t, w, h);
        // IE won't show transparent fill rect, so stroke a rect also.
        ctx.strokeRect(l, t, w, h);
        ctx = null;
    }


    $.jqplot.CursorLegendRenderer = function (options) {
        $.jqplot.TableLegendRenderer.call(this, options);
        this.formatString = '%s';
    };

    $.jqplot.CursorLegendRenderer.prototype = new $.jqplot.TableLegendRenderer();
    $.jqplot.CursorLegendRenderer.prototype.constructor = $.jqplot.CursorLegendRenderer;

    // called in context of a Legend
    $.jqplot.CursorLegendRenderer.prototype.draw = function () {
        if (this._elem) {
            this._elem.emptyForce();
            this._elem = null;
        }
        if (this.show) {
            var series = this._series, s;
            // make a table.  one line label per row.
            var elem = document.createElement('div');
            this._elem = $(elem);
            elem = null;
            this._elem.addClass('jqplot-legend jqplot-cursor-legend');
            this._elem.css('position', 'absolute');

            var pad = false;
            for (var i = 0; i < series.length; i++) {
                s = series[i];
                if (s.show && s.showLabel) {
                    var lt = $.jqplot.sprintf(this.formatString, s.label.toString());
                    if (lt) {
                        var color = s.color;
                        if (s._stack && !s.fill) {
                            color = '';
                        }
                        addrow.call(this, lt, color, pad, i);
                        pad = true;
                    }
                    // let plugins add more rows to legend.  Used by trend line plugin.
                    for (var j = 0; j < $.jqplot.addLegendRowHooks.length; j++) {
                        var item = $.jqplot.addLegendRowHooks[j].call(this, s);
                        if (item) {
                            addrow.call(this, item.label, item.color, pad);
                            pad = true;
                        }
                    }
                }
            }
            series = s = null;
            delete series;
            delete s;
        }

        function addrow(label, color, pad, idx) {
            var rs = (pad) ? this.rowSpacing : '0';
            var tr = $('<tr class="jqplot-legend jqplot-cursor-legend"></tr>').appendTo(this._elem);
            tr.data('seriesIndex', idx);
            $('<td class="jqplot-legend jqplot-cursor-legend-swatch" style="padding-top:' + rs + ';">' +
                '<div style="border:1px solid #cccccc;padding:0.2em;">' +
                '<div class="jqplot-cursor-legend-swatch" style="background-color:' + color + ';"></div>' +
                '</div></td>').appendTo(tr);
            var td = $('<td class="jqplot-legend jqplot-cursor-legend-label" style="vertical-align:middle;padding-top:' + rs + ';"></td>');
            td.appendTo(tr);
            td.data('seriesIndex', idx);
            if (this.escapeHtml) {
                td.text(label);
            }
            else {
                td.html(label);
            }
            tr = null;
            td = null;
        }
        return this._elem;
    };

})(jQuery);