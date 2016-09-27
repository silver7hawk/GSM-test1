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
    * Class: $.jqplot.DateAxisRenderer
    * A plugin for a jqPlot to render an axis as a series of date values.
    * This renderer has no options beyond those supplied by the <Axis> class.
    * It supplies it's own tick formatter, so the tickOptions.formatter option
    * should not be overridden.
    * 
    * Thanks to Ken Synder for his enhanced Date instance methods which are
    * included with this code <http://kendsnyder.com/sandbox/date/>.
    * 
    * To use this renderer, include the plugin in your source
    * > <script type="text/javascript" language="javascript" src="plugins/jqplot.dateAxisRenderer.js"></script>
    * 
    * and supply the appropriate options to your plot
    * 
    * > {axes:{xaxis:{renderer:$.jqplot.DateAxisRenderer}}}
    * 
    * Dates can be passed into the axis in almost any recognizable value and 
    * will be parsed.  They will be rendered on the axis in the format
    * specified by tickOptions.formatString.  e.g. tickOptions.formatString = '%Y-%m-%d'.
    * 
    * Accecptable format codes 
    * are:
    * 
    * > Code    Result                  Description
    * >             == Years ==
    * > %Y      2008                Four-digit year
    * > %y      08                  Two-digit year
    * >             == Months ==
    * > %m      09                  Two-digit month
    * > %#m     9                   One or two-digit month
    * > %B      September           Full month name
    * > %b      Sep                 Abbreviated month name
    * >             == Days ==
    * > %d      05                  Two-digit day of month
    * > %#d     5                   One or two-digit day of month
    * > %e      5                   One or two-digit day of month
    * > %A      Sunday              Full name of the day of the week
    * > %a      Sun                 Abbreviated name of the day of the week
    * > %w      0                   Number of the day of the week (0 = Sunday, 6 = Saturday)
    * > %o      th                  The ordinal suffix string following the day of the month
    * >             == Hours ==
    * > %H      23                  Hours in 24-hour format (two digits)
    * > %#H     3                   Hours in 24-hour integer format (one or two digits)
    * > %I      11                  Hours in 12-hour format (two digits)
    * > %#I     3                   Hours in 12-hour integer format (one or two digits)
    * > %p      PM                  AM or PM
    * >             == Minutes ==
    * > %M      09                  Minutes (two digits)
    * > %#M     9                   Minutes (one or two digits)
    * >             == Seconds ==
    * > %S      02                  Seconds (two digits)
    * > %#S     2                   Seconds (one or two digits)
    * > %s      1206567625723       Unix timestamp (Seconds past 1970-01-01 00:00:00)
    * >             == Milliseconds ==
    * > %N      008                 Milliseconds (three digits)
    * > %#N     8                   Milliseconds (one to three digits)
    * >             == Timezone ==
    * > %O      360                 difference in minutes between local time and GMT
    * > %Z      Mountain Standard Time  Name of timezone as reported by browser
    * > %G      -06:00              Hours and minutes between GMT
    * >             == Shortcuts ==
    * > %F      2008-03-26          %Y-%m-%d
    * > %T      05:06:30            %H:%M:%S
    * > %X      05:06:30            %H:%M:%S
    * > %x      03/26/08            %m/%d/%y
    * > %D      03/26/08            %m/%d/%y
    * > %#c     Wed Mar 26 15:31:00 2008  %a %b %e %H:%M:%S %Y
    * > %v      3-Sep-2008          %e-%b-%Y
    * > %R      15:31               %H:%M
    * > %r      3:31:00 PM          %I:%M:%S %p
    * >             == Characters ==
    * > %n      \n                  Newline
    * > %t      \t                  Tab
    * > %%      %                   Percent Symbol 
    */
    $.jqplot.DateAxisRenderer = function () {
        $.jqplot.LinearAxisRenderer.call(this);
        this.date = new $.jsDate();
    };

    var second = 1000;
    var minute = 60 * second;
    var hour = 60 * minute;
    var day = 24 * hour;
    var week = 7 * day;

    // these are less definitive
    var month = 30.4368499 * day;
    var year = 365.242199 * day;

    var daysInMonths = [31, 28, 31, 30, 31, 30, 31, 30, 31, 30, 31, 30];
    // array of consistent nice intervals.  Longer intervals
    // will depend on days in month, days in year, etc.
    var niceFormatStrings = ['%M:%S.%#N', '%M:%S.%#N', '%M:%S.%#N', '%M:%S', '%M:%S', '%M:%S', '%M:%S', '%H:%M:%S', '%H:%M:%S', '%H:%M', '%H:%M', '%H:%M', '%H:%M', '%H:%M', '%H:%M', '%a %H:%M', '%a %H:%M', '%b %e %H:%M', '%b %e %H:%M', '%b %e %H:%M', '%b %e %H:%M', '%v', '%v', '%v', '%v', '%v', '%v', '%v'];
    var niceIntervals = [0.1 * second, 0.2 * second, 0.5 * second, second, 2 * second, 5 * second, 10 * second, 15 * second, 30 * second, minute, 2 * minute, 5 * minute, 10 * minute, 15 * minute, 30 * minute, hour, 2 * hour, 4 * hour, 6 * hour, 8 * hour, 12 * hour, day, 2 * day, 3 * day, 4 * day, 5 * day, week, 2 * week];

    var niceMonthlyIntervals = [];

    function bestDateInterval(min, max, titarget) {
        // iterate through niceIntervals to find one closest to titarget
        var badness = Number.MAX_VALUE;
        var temp, bestTi, bestfmt;
        for (var i = 0, l = niceIntervals.length; i < l; i++) {
            temp = Math.abs(titarget - niceIntervals[i]);
            if (temp < badness) {
                badness = temp;
                bestTi = niceIntervals[i];
                bestfmt = niceFormatStrings[i];
            }
        }

        return [bestTi, bestfmt];
    }

    $.jqplot.DateAxisRenderer.prototype = new $.jqplot.LinearAxisRenderer();
    $.jqplot.DateAxisRenderer.prototype.constructor = $.jqplot.DateAxisRenderer;

    $.jqplot.DateTickFormatter = function (format, val) {
        if (!format) {
            format = '%Y/%m/%d';
        }
        return $.jsDate.strftime(val, format);
    };

    $.jqplot.DateAxisRenderer.prototype.init = function (options) {
        // prop: tickRenderer
        // A class of a rendering engine for creating the ticks labels displayed on the plot, 
        // See <$.jqplot.AxisTickRenderer>.
        // this.tickRenderer = $.jqplot.AxisTickRenderer;
        // this.labelRenderer = $.jqplot.AxisLabelRenderer;
        this.tickOptions.formatter = $.jqplot.DateTickFormatter;
        // prop: tickInset
        // Controls the amount to inset the first and last ticks from 
        // the edges of the grid, in multiples of the tick interval.
        // 0 is no inset, 0.5 is one half a tick interval, 1 is a full
        // tick interval, etc.
        this.tickInset = 0;
        // prop: drawBaseline
        // True to draw the axis baseline.
        this.drawBaseline = true;
        // prop: baselineWidth
        // width of the baseline in pixels.
        this.baselineWidth = null;
        // prop: baselineColor
        // CSS color spec for the baseline.
        this.baselineColor = null;
        this.daTickInterval = null;
        this._daTickInterval = null;

        $.extend(true, this, options);

        var db = this._dataBounds,
            stats,
            sum,
            s,
            d,
            pd,
            sd,
            intv;

        // Go through all the series attached to this axis and find
        // the min/max bounds for this axis.
        for (var i = 0; i < this._series.length; i++) {
            stats = { intervals: [], frequencies: {}, sortedIntervals: [], min: null, max: null, mean: null };
            sum = 0;
            s = this._series[i];
            d = s.data;
            pd = s._plotData;
            sd = s._stackData;
            intv = 0;

            for (var j = 0; j < d.length; j++) {
                if (this.name == 'xaxis' || this.name == 'x2axis') {
                    d[j][0] = new $.jsDate(d[j][0]).getTime();
                    pd[j][0] = new $.jsDate(d[j][0]).getTime();
                    sd[j][0] = new $.jsDate(d[j][0]).getTime();
                    if ((d[j][0] != null && d[j][0] < db.min) || db.min == null) {
                        db.min = d[j][0];
                    }
                    if ((d[j][0] != null && d[j][0] > db.max) || db.max == null) {
                        db.max = d[j][0];
                    }
                    if (j > 0) {
                        intv = Math.abs(d[j][0] - d[j - 1][0]);
                        stats.intervals.push(intv);
                        if (stats.frequencies.hasOwnProperty(intv)) {
                            stats.frequencies[intv] += 1;
                        }
                        else {
                            stats.frequencies[intv] = 1;
                        }
                    }
                    sum += intv;

                }
                else {
                    d[j][1] = new $.jsDate(d[j][1]).getTime();
                    pd[j][1] = new $.jsDate(d[j][1]).getTime();
                    sd[j][1] = new $.jsDate(d[j][1]).getTime();
                    if ((d[j][1] != null && d[j][1] < db.min) || db.min == null) {
                        db.min = d[j][1];
                    }
                    if ((d[j][1] != null && d[j][1] > db.max) || db.max == null) {
                        db.max = d[j][1];
                    }
                    if (j > 0) {
                        intv = Math.abs(d[j][1] - d[j - 1][1]);
                        stats.intervals.push(intv);
                        if (stats.frequencies.hasOwnProperty(intv)) {
                            stats.frequencies[intv] += 1;
                        }
                        else {
                            stats.frequencies[intv] = 1;
                        }
                    }
                }
                sum += intv;
            }

            if (s.renderer.bands) {
                if (s.renderer.bands.hiData.length) {
                    var bd = s.renderer.bands.hiData;
                    for (var j = 0, l = bd.length; j < l; j++) {
                        if (this.name === 'xaxis' || this.name === 'x2axis') {
                            bd[j][0] = new $.jsDate(bd[j][0]).getTime();
                            if ((bd[j][0] != null && bd[j][0] > db.max) || db.max == null) {
                                db.max = bd[j][0];
                            }
                        }
                        else {
                            bd[j][1] = new $.jsDate(bd[j][1]).getTime();
                            if ((bd[j][1] != null && bd[j][1] > db.max) || db.max == null) {
                                db.max = bd[j][1];
                            }
                        }
                    }
                }
                if (s.renderer.bands.lowData.length) {
                    var bd = s.renderer.bands.lowData;
                    for (var j = 0, l = bd.length; j < l; j++) {
                        if (this.name === 'xaxis' || this.name === 'x2axis') {
                            bd[j][0] = new $.jsDate(bd[j][0]).getTime();
                            if ((bd[j][0] != null && bd[j][0] < db.min) || db.min == null) {
                                db.min = bd[j][0];
                            }
                        }
                        else {
                            bd[j][1] = new $.jsDate(bd[j][1]).getTime();
                            if ((bd[j][1] != null && bd[j][1] < db.min) || db.min == null) {
                                db.min = bd[j][1];
                            }
                        }
                    }
                }
            }

            var tempf = 0,
                tempn = 0;
            for (var n in stats.frequencies) {
                stats.sortedIntervals.push({ interval: n, frequency: stats.frequencies[n] });
            }
            stats.sortedIntervals.sort(function (a, b) {
                return b.frequency - a.frequency;
            });

            stats.min = $.jqplot.arrayMin(stats.intervals);
            stats.max = $.jqplot.arrayMax(stats.intervals);
            stats.mean = sum / d.length;
            this._intervalStats.push(stats);
            stats = sum = s = d = pd = sd = null;
        }
        db = null;
        this.groups = 1;
        this.groupLabels = [];
        this._groupLabels = [];
        if (this.groupLabels.length) {
            this.groups = this.groupLabels.length;
        }

    };

    // called with scope of an axis
    $.jqplot.DateAxisRenderer.prototype.reset = function () {
        this.min = this._options.min;
        this.max = this._options.max;
        this.tickInterval = this._options.tickInterval;
        this.numberTicks = this._options.numberTicks;
        this._autoFormatString = '';
        if (this._overrideFormatString && this.tickOptions && this.tickOptions.formatString) {
            this.tickOptions.formatString = '';
        }
        this.daTickInterval = this._daTickInterval;
        // this._ticks = this.__ticks;
    };

    $.jqplot.DateAxisRenderer.prototype.createTicks1 = function () {
        // we're are operating on an axis here
        var ticks = this._ticks;
        var userTicks = this.ticks;
        var name = this.name;
        // databounds were set on axis initialization.
        var db = this._dataBounds;
        var dim, interval;
        var min, max;
        var pos1, pos2;
        var tt, i;

        // if we already have ticks, use them.
        if (userTicks.length) {
            // adjust with blanks if we have groups
            if (this.groups > 1 && !this._grouped) {
                var l = userTicks.length;
                var skip = parseInt(l / this.groups, 10);
                var count = 0;
                for (var i = skip; i < l; i += skip) {
                    userTicks.splice(i + count, 0, ' ');
                    count++;
                }
                this._grouped = true;
            }
            this.min = 0.5;
            this.max = userTicks.length + 0.5;
            var range = this.max - this.min;
            this.numberTicks = 2 * userTicks.length + 1;
            for (i = 0; i < userTicks.length; i++) {
                tt = this.min + 2 * i * range / (this.numberTicks - 1);
                // need a marker before and after the tick
                var t = new this.tickRenderer(this.tickOptions);
                t.showLabel = false;
                // t.showMark = true;
                t.setTick(tt, this.name);
                this._ticks.push(t);
                var t = new this.tickRenderer(this.tickOptions);
                t.label = userTicks[i];
                // t.showLabel = true;
                t.showMark = false;
                t.showGridline = false;
                t.setTick(tt + 0.5, this.name);
                this._ticks.push(t);
            }
            // now add the last tick at the end
            var t = new this.tickRenderer(this.tickOptions);
            t.showLabel = false;
            // t.showMark = true;
            t.setTick(tt + 1, this.name);
            this._ticks.push(t);
        }

        // we don't have any ticks yet, let's make some!
        else {
            if (name == 'xaxis' || name == 'x2axis') {
                dim = this._plotDimensions.width;
            }
            else {
                dim = this._plotDimensions.height;
            }

            // if min, max and number of ticks specified, user can't specify interval.
            if (this.min != null && this.max != null && this.numberTicks != null) {
                this.tickInterval = null;
            }

            // if max, min, and interval specified and interval won't fit, ignore interval.
            if (this.min != null && this.max != null && this.tickInterval != null) {
                if (parseInt((this.max - this.min) / this.tickInterval, 10) != (this.max - this.min) / this.tickInterval) {
                    this.tickInterval = null;
                }
            }

            // find out how many categories are in the lines and collect labels
            var labels = [];
            var numcats = 0;
            var min = 0.5;
            var max, val;
            var isMerged = false;
            for (var i = 0; i < this._series.length; i++) {
                var s = this._series[i];
                for (var j = 0; j < s.data.length; j++) {
                    if (this.name == 'xaxis' || this.name == 'x2axis') {
                        val = s.data[j][0];
                    }
                    else {
                        val = s.data[j][1];
                    }
                    if ($.inArray(val, labels) == -1) {
                        isMerged = true;
                        numcats += 1;
                        labels.push(val);
                    }
                }
            }

            if (isMerged && this.sortMergedLabels) {
                labels.sort(function (a, b) { return a - b; });
            }

            // keep a reference to these tick labels to use for redrawing plot (see bug #57)
            this.ticks = labels;

            // now bin the data values to the right lables.
            for (var i = 0; i < this._series.length; i++) {
                var s = this._series[i];
                for (var j = 0; j < s.data.length; j++) {
                    if (this.name == 'xaxis' || this.name == 'x2axis') {
                        val = s.data[j][0];
                    }
                    else {
                        val = s.data[j][1];
                    }
                    // for category axis, force the values into category bins.
                    // we should have the value in the label array now.
                    var idx = $.inArray(val, labels) + 1;
                    if (this.name == 'xaxis' || this.name == 'x2axis') {
                        s.data[j][0] = idx;
                    }
                    else {
                        s.data[j][1] = idx;
                    }
                }
            }

            // adjust with blanks if we have groups
            if (this.groups > 1 && !this._grouped) {
                var l = labels.length;
                var skip = parseInt(l / this.groups, 10);
                var count = 0;
                for (var i = skip; i < l; i += skip + 1) {
                    labels[i] = ' ';
                }
                this._grouped = true;
            }

            max = numcats + 0.5;
            if (this.numberTicks == null) {
                this.numberTicks = 2 * numcats + 1;
            }

            var range = max - min;
            this.min = min;
            this.max = max;
            var track = 0;

            // todo: adjust this so more ticks displayed.
            var maxVisibleTicks = parseInt(3 + dim / 10, 10);
            var skip = parseInt(numcats / maxVisibleTicks, 10);

            if (this.tickInterval == null) {

                this.tickInterval = range / (this.numberTicks - 1);

            }
            // if tickInterval is specified, we will ignore any computed maximum.
            for (var i = 0; i < this.numberTicks; i++) {
                tt = this.min + i * this.tickInterval;
                var t = new this.tickRenderer(this.tickOptions);
                // if even tick, it isn't a category, it's a divider
                if (i / 2 == parseInt(i / 2, 10)) {
                    t.showLabel = false;
                    t.showMark = true;
                }
                else {
                    if (skip > 0 && track < skip) {
                        t.showLabel = false;
                        track += 1;
                    }
                    else {
                        t.showLabel = true;
                        track = 0;
                    }
                    t.label = t.formatter(t.formatString, labels[(i - 1) / 2]);
                    t.showMark = false;
                    t.showGridline = false;
                }
                t.setTick(tt, this.name);
                this._ticks.push(t);
            }
        }

    };

    $.jqplot.DateAxisRenderer.prototype.createTicks = function (plot) {
        // we're are operating on an axis here
        var ticks = this._ticks;
        var userTicks = this.ticks;
        var name = this.name;
        // databounds were set on axis initialization.
        var db = this._dataBounds;
        var iv = this._intervalStats;
        var dim = (this.name.charAt(0) === 'x') ? this._plotDimensions.width : this._plotDimensions.height;
        var interval;
        var min, max;
        var pos1, pos2;
        var tt, i;
        var threshold = 30;
        var insetMult = 1;

        var tickInterval = this.tickInterval;

        // if we already have ticks, use them.
        // ticks must be in order of increasing value.

        min = ((this.min != null) ? new $.jsDate(this.min).getTime() : db.min);
        max = ((this.max != null) ? new $.jsDate(this.max).getTime() : db.max);

        // see if we're zooming.  if we are, don't use the min and max we're given,
        // but compute some nice ones.  They will be reset later.

        var cursor = plot.plugins.cursor;

        if (cursor && cursor._zoom && cursor._zoom.zooming) {
            this.min = null;
            this.max = null;
        }

        var range = max - min;

        if (this.tickOptions == null || !this.tickOptions.formatString) {
            this._overrideFormatString = true;
        }

        if (userTicks.length) {
            // ticks could be 1D or 2D array of [val, val, ,,,] or [[val, label], [val, label], ...] or mixed
            for (i = 0; i < userTicks.length; i++) {
                var ut = userTicks[i];
                var t = new this.tickRenderer(this.tickOptions);
                if (ut.constructor == Array) {
                    t.value = new $.jsDate(ut[0]).getTime();
                    t.label = ut[1];
                    if (!this.showTicks) {
                        t.showLabel = false;
                        t.showMark = false;
                    }
                    else if (!this.showTickMarks) {
                        t.showMark = false;
                    }
                    t.setTick(t.value, this.name);
                    this._ticks.push(t);
                }

                else {
                    t.value = new $.jsDate(ut).getTime();
                    if (!this.showTicks) {
                        t.showLabel = false;
                        t.showMark = false;
                    }
                    else if (!this.showTickMarks) {
                        t.showMark = false;
                    }
                    t.setTick(t.value, this.name);
                    this._ticks.push(t);
                }
            }
            this.numberTicks = userTicks.length;
            this.min = this._ticks[0].value;
            this.max = this._ticks[this.numberTicks - 1].value;
            this.daTickInterval = [(this.max - this.min) / (this.numberTicks - 1) / 1000, 'seconds'];
        }

        ////////
        // We don't have any ticks yet, let's make some!
        ////////

        // if user specified min and max are null, we set those to make best ticks.
        else if (this.min == null && this.max == null) {
            var opts = $.extend(true, {}, this.tickOptions, { name: this.name, value: null });
            // want to find a nice interval 
            var nttarget,
                titarget;

            // if no tickInterval or numberTicks options specified,  make a good guess.
            if (!this.tickInterval && !this.numberTicks) {
                var tdim = Math.max(dim, threshold + 1);
                // how many ticks to put on the axis?
                // date labels tend to be long.  If ticks not rotated,
                // don't use too many and have a high spacing factor.
                // If we are rotating ticks, use a lower factor.
                var spacingFactor = 115;
                if (this.tickRenderer === $.jqplot.CanvasAxisTickRenderer && this.tickOptions.angle) {
                    spacingFactor = 115 - 40 * Math.abs(Math.sin(this.tickOptions.angle / 180 * Math.PI));
                }

                nttarget = Math.ceil((tdim - threshold) / spacingFactor + 1);
                titarget = (max - min) / (nttarget - 1);
            }

            // If tickInterval is specified, we'll try to honor it.
            // Not gauranteed to get this interval, but we'll get as close as
            // we can.
            // tickInterval will be used before numberTicks, that is if
            // both are specified, numberTicks will be ignored.
            else if (this.tickInterval) {
                titarget = this.tickInterval;
            }

            // if numberTicks specified, try to honor it.
            // Not gauranteed, but will try to get close.
            else if (this.numberTicks) {
                nttarget = this.numberTicks;
                titarget = (max - min) / (nttarget - 1);
            }

            // If we can use an interval of 2 weeks or less, pick best one
            if (titarget <= 19 * day) {
                var ret = bestDateInterval(min, max, titarget);
                var tempti = ret[0];
                this._autoFormatString = ret[1];

                min = Math.floor(min / tempti) * tempti;
                min = new $.jsDate(min);
                min = min.getTime() + min.getUtcOffset();

                nttarget = Math.ceil((max - min) / tempti) + 1;
                this.min = min;
                this.max = min + (nttarget - 1) * tempti;

                // if max is less than max, add an interval
                if (this.max < max) {
                    this.max += tempti;
                    nttarget += 1;
                }
                this.tickInterval = tempti;
                this.numberTicks = nttarget;

                for (var i = 0; i < nttarget; i++) {
                    opts.value = this.min + i * tempti;
                    t = new this.tickRenderer(opts);

                    if (this._overrideFormatString && this._autoFormatString != '') {
                        t.formatString = this._autoFormatString;
                    }
                    if (!this.showTicks) {
                        t.showLabel = false;
                        t.showMark = false;
                    }
                    else if (!this.showTickMarks) {
                        t.showMark = false;
                    }
                    this._ticks.push(t);
                }

                insetMult = this.tickInterval;
            }

            // should we use a monthly interval?
            else if (titarget <= 9 * month) {

                this._autoFormatString = '%v';

                // how many months in an interval?
                var intv = Math.round(titarget / month);
                if (intv < 1) {
                    intv = 1;
                }
                else if (intv > 6) {
                    intv = 6;
                }

                // figure out the starting month and ending month.
                var mstart = new $.jsDate(min).setDate(1).setHours(0, 0, 0, 0);

                // See if max ends exactly on a month
                var tempmend = new $.jsDate(max);
                var mend = new $.jsDate(max).setDate(1).setHours(0, 0, 0, 0);

                if (tempmend.getTime() !== mend.getTime()) {
                    mend = mend.add(1, 'month');
                }

                var nmonths = mend.diff(mstart, 'month');

                nttarget = Math.ceil(nmonths / intv) + 1;

                this.min = mstart.getTime();
                this.max = mstart.clone().add((nttarget - 1) * intv, 'month').getTime();
                this.numberTicks = nttarget;

                for (var i = 0; i < nttarget; i++) {
                    if (i === 0) {
                        opts.value = mstart.getTime();
                    }
                    else {
                        opts.value = mstart.add(intv, 'month').getTime();
                    }
                    t = new this.tickRenderer(opts);

                    if (this._overrideFormatString && this._autoFormatString != '') {
                        t.formatString = this._autoFormatString;
                    }
                    if (!this.showTicks) {
                        t.showLabel = false;
                        t.showMark = false;
                    }
                    else if (!this.showTickMarks) {
                        t.showMark = false;
                    }
                    this._ticks.push(t);
                }

                insetMult = intv * month;
            }

            // use yearly intervals
            else {

                this._autoFormatString = '%v';

                // how many years in an interval?
                var intv = Math.round(titarget / year);
                if (intv < 1) {
                    intv = 1;
                }

                // figure out the starting and ending years.
                var mstart = new $.jsDate(min).setMonth(0, 1).setHours(0, 0, 0, 0);
                var mend = new $.jsDate(max).add(1, 'year').setMonth(0, 1).setHours(0, 0, 0, 0);

                var nyears = mend.diff(mstart, 'year');

                nttarget = Math.ceil(nyears / intv) + 1;

                this.min = mstart.getTime();
                this.max = mstart.clone().add((nttarget - 1) * intv, 'year').getTime();
                this.numberTicks = nttarget;

                for (var i = 0; i < nttarget; i++) {
                    if (i === 0) {
                        opts.value = mstart.getTime();
                    }
                    else {
                        opts.value = mstart.add(intv, 'year').getTime();
                    }
                    t = new this.tickRenderer(opts);

                    if (this._overrideFormatString && this._autoFormatString != '') {
                        t.formatString = this._autoFormatString;
                    }
                    if (!this.showTicks) {
                        t.showLabel = false;
                        t.showMark = false;
                    }
                    else if (!this.showTickMarks) {
                        t.showMark = false;
                    }
                    this._ticks.push(t);
                }

                insetMult = intv * year;
            }
        }

        ////////
        // Some option(s) specified, work around that.
        ////////

        else {
            if (name == 'xaxis' || name == 'x2axis') {
                dim = this._plotDimensions.width;
            }
            else {
                dim = this._plotDimensions.height;
            }

            // if min, max and number of ticks specified, user can't specify interval.
            if (this.min != null && this.max != null && this.numberTicks != null) {
                this.tickInterval = null;
            }

            // if user specified a tick interval, convert to usable.
            if (this.tickInterval != null) {
                // if interval is a number or can be converted to one, use it.
                // Assume it is in SECONDS!!!
                if (Number(this.tickInterval)) {
                    this.daTickInterval = [Number(this.tickInterval), 'seconds'];
                }
                // else, parse out something we can build from.
                else if (typeof this.tickInterval == "string") {
                    var parts = this.tickInterval.split(' ');
                    if (parts.length == 1) {
                        this.daTickInterval = [1, parts[0]];
                    }
                    else if (parts.length == 2) {
                        this.daTickInterval = [parts[0], parts[1]];
                    }
                }
            }

            // if min and max are same, space them out a bit
            if (min == max) {
                var adj = 24 * 60 * 60 * 500;  // 1/2 day
                min -= adj;
                max += adj;
            }

            range = max - min;

            var optNumTicks = 2 + parseInt(Math.max(0, dim - 100) / 100, 10);


            var rmin, rmax;

            rmin = (this.min != null) ? new $.jsDate(this.min).getTime() : min - range / 2 * (this.padMin - 1);
            rmax = (this.max != null) ? new $.jsDate(this.max).getTime() : max + range / 2 * (this.padMax - 1);
            this.min = rmin;
            this.max = rmax;
            range = this.max - this.min;

            if (this.numberTicks == null) {
                // if tickInterval is specified by user, we will ignore computed maximum.
                // max will be equal or greater to fit even # of ticks.
                if (this.daTickInterval != null) {
                    var nc = new $.jsDate(this.max).diff(this.min, this.daTickInterval[1], true);
                    this.numberTicks = Math.ceil(nc / this.daTickInterval[0]) + 1;
                    // this.max = new $.jsDate(this.min).add(this.numberTicks-1, this.daTickInterval[1]).getTime();
                    this.max = new $.jsDate(this.min).add((this.numberTicks - 1) * this.daTickInterval[0], this.daTickInterval[1]).getTime();
                }
                else if (dim > 200) {
                    this.numberTicks = parseInt(3 + (dim - 200) / 100, 10);
                }
                else {
                    this.numberTicks = 2;
                }
            }

            insetMult = range / (this.numberTicks - 1) / 1000;

            if (this.daTickInterval == null) {
                this.daTickInterval = [insetMult, 'seconds'];
            }


            for (var i = 0; i < this.numberTicks; i++) {
                var min = new $.jsDate(this.min);
                tt = min.add(i * this.daTickInterval[0], this.daTickInterval[1]).getTime();
                var t = new this.tickRenderer(this.tickOptions);
                // var t = new $.jqplot.AxisTickRenderer(this.tickOptions);
                if (!this.showTicks) {
                    t.showLabel = false;
                    t.showMark = false;
                }
                else if (!this.showTickMarks) {
                    t.showMark = false;
                }
                t.setTick(tt, this.name);
                this._ticks.push(t);
            }
        }

        if (this.tickInset) {
            this.min = this.min - this.tickInset * insetMult;
            this.max = this.max + this.tickInset * insetMult;
        }

        if (this._daTickInterval == null) {
            this._daTickInterval = this.daTickInterval;
        }

        ticks = null;
    };


    // called with scope of axis
    $.jqplot.DateAxisRenderer.prototype.pack = function (pos, offsets) {
        var ticks = this._ticks;
        var max = this.max;
        var min = this.min;
        var offmax = offsets.max;
        var offmin = offsets.min;
        var lshow = (this._label == null) ? false : this._label.show;
        var i;

        for (var p in pos) {
            this._elem.css(p, pos[p]);
        }

        this._offsets = offsets;
        // pixellength will be + for x axes and - for y axes becasue pixels always measured from top left.
        var pixellength = offmax - offmin;
        var unitlength = max - min;

        // point to unit and unit to point conversions references to Plot DOM element top left corner.
        this.p2u = function (p) {
            return (p - offmin) * unitlength / pixellength + min;
        };

        this.u2p = function (u) {
            return (u - min) * pixellength / unitlength + offmin;
        };

        if (this.name == 'xaxis' || this.name == 'x2axis') {
            this.series_u2p = function (u) {
                return (u - min) * pixellength / unitlength;
            };
            this.series_p2u = function (p) {
                return p * unitlength / pixellength + min;
            };
        }

        else {
            this.series_u2p = function (u) {
                return (u - max) * pixellength / unitlength;
            };
            this.series_p2u = function (p) {
                return p * unitlength / pixellength + max;
            };
        }

        if (this.show) {
            if (this.name == 'xaxis' || this.name == 'x2axis') {
                for (i = 0; i < ticks.length; i++) {
                    var t = ticks[i];
                    if (t.show && t.showLabel) {
                        var shim;

                        if (t.constructor == $.jqplot.CanvasAxisTickRenderer && t.angle) {
                            // will need to adjust auto positioning based on which axis this is.
                            var temp = (this.name == 'xaxis') ? 1 : -1;
                            switch (t.labelPosition) {
                                case 'auto':
                                    // position at end
                                    if (temp * t.angle < 0) {
                                        shim = -t.getWidth() + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    }
                                    // position at start
                                    else {
                                        shim = -t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;
                                    }
                                    break;
                                case 'end':
                                    shim = -t.getWidth() + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    break;
                                case 'start':
                                    shim = -t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;
                                    break;
                                case 'middle':
                                    shim = -t.getWidth() / 2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    break;
                                default:
                                    shim = -t.getWidth() / 2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    break;
                            }
                        }
                        else {
                            shim = -t.getWidth() / 2;
                        }
                        var val = this.u2p(t.value) + shim + 'px';
                        t._elem.css('left', val);
                        t.pack();
                    }
                }

                var labeledge = ['bottom', 0];
                if (lshow) {
                    var w = this._label._elem.outerWidth(true);
                    this._label._elem.css('left', offmin + pixellength / 2 - w / 2 + 'px');
                    if (this.name == 'xaxis') {
                        this._label._elem.css('bottom', '0px');
                        labeledge = ['bottom', this._label._elem.outerHeight(true)];
                    }
                    else {
                        this._label._elem.css('top', '0px');
                        labeledge = ['top', this._label._elem.outerHeight(true)];
                    }
                    this._label.pack();
                }

                // draw the group labels
                var step = parseInt(this._ticks.length / this.groups, 10);
                for (i = 0; i < this._groupLabels.length; i++) {
                    var mid = 0;
                    var count = 0;
                    for (var j = i * step; j <= (i + 1) * step; j++) {
                        if (this._ticks[j]._elem && this._ticks[j].label != " ") {
                            var t = this._ticks[j]._elem;
                            var p = t.position();
                            mid += p.left + t.outerWidth(true) / 2;
                            count++;
                        }
                    }
                    mid = mid / count;
                    this._groupLabels[i].css({ 'left': (mid - this._groupLabels[i].outerWidth(true) / 2) });
                    this._groupLabels[i].css(labeledge[0], labeledge[1]);
                }
            }
            else {
                for (i = 0; i < ticks.length; i++) {
                    var t = ticks[i];
                    if (t.show && t.showLabel) {
                        var shim;
                        if (t.constructor == $.jqplot.CanvasAxisTickRenderer && t.angle) {
                            // will need to adjust auto positioning based on which axis this is.
                            var temp = (this.name == 'yaxis') ? 1 : -1;
                            switch (t.labelPosition) {
                                case 'auto':
                                    // position at end
                                case 'end':
                                    if (temp * t.angle < 0) {
                                        shim = -t._textRenderer.height * Math.cos(-t._textRenderer.angle) / 2;
                                    }
                                    else {
                                        shim = -t.getHeight() + t._textRenderer.height * Math.cos(t._textRenderer.angle) / 2;
                                    }
                                    break;
                                case 'start':
                                    if (t.angle > 0) {
                                        shim = -t._textRenderer.height * Math.cos(-t._textRenderer.angle) / 2;
                                    }
                                    else {
                                        shim = -t.getHeight() + t._textRenderer.height * Math.cos(t._textRenderer.angle) / 2;
                                    }
                                    break;
                                case 'middle':
                                    // if (t.angle > 0) {
                                    //     shim = -t.getHeight()/2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    // }
                                    // else {
                                    //     shim = -t.getHeight()/2 - t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;
                                    // }
                                    shim = -t.getHeight() / 2;
                                    break;
                                default:
                                    shim = -t.getHeight() / 2;
                                    break;
                            }
                        }
                        else {
                            shim = -t.getHeight() / 2;
                        }

                        var val = this.u2p(t.value) + shim + 'px';
                        t._elem.css('top', val);
                        t.pack();
                    }
                }

                var labeledge = ['left', 0];
                if (lshow) {
                    var h = this._label._elem.outerHeight(true);
                    this._label._elem.css('top', offmax - pixellength / 2 - h / 2 + 'px');
                    if (this.name == 'yaxis') {
                        this._label._elem.css('left', '0px');
                        labeledge = ['left', this._label._elem.outerWidth(true)];
                    }
                    else {
                        this._label._elem.css('right', '0px');
                        labeledge = ['right', this._label._elem.outerWidth(true)];
                    }
                    this._label.pack();
                }

                // draw the group labels, position top here, do left after label position.
                var step = parseInt(this._ticks.length / this.groups, 10);
                for (i = 0; i < this._groupLabels.length; i++) {
                    var mid = 0;
                    var count = 0;
                    for (var j = i * step; j <= (i + 1) * step; j++) {
                        if (this._ticks[j]._elem && this._ticks[j].label != " ") {
                            var t = this._ticks[j]._elem;
                            var p = t.position();
                            mid += p.top + t.outerHeight() / 2;
                            count++;
                        }
                    }
                    mid = mid / count;
                    this._groupLabels[i].css({ 'top': mid - this._groupLabels[i].outerHeight() / 2 });
                    this._groupLabels[i].css(labeledge[0], labeledge[1]);

                }
            }
        }
    };


})(jQuery);

