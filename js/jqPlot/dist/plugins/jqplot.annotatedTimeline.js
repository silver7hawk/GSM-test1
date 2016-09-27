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

    $.jqplot.cursorLegendFormatter = function (obj, label, x, y) {
        if (y && y != 0 && y != "") {
            return $.jqplot.sprintf(obj.formatString, label, x, y);
        }
    };

    var cursorLegendFormatter = {
        formatter: $.jqplot.cursorLegendFormatter,
        formatString: "<p style='display:none'>%s</p>&nbsp;%s &bullet; %s",
        xaxis: {
            formatter: $.jqplot.DateTickFormatter,
            formatString: "%I:%M %P"
        }
    };

    var salsaControllerTheme = {
        series: [
            {
                color: 'rgba(255,176,86,1)',
                lineWidth: 1
            }
        ],
        grid: {
            backgroundColor: "#ffffff",
            borderColor: "rgb(100,100,124)"
        }
    };

    var salsaThemeExtension = {
        grid: {
            backgroundColor: "#EEFFFF",
            gridLineColor: "#6E6EBE",
            borderColor: "rgb(100,100,124)"
        },
        series: [{
            color: "#cc5500", // '#db7720', // 'rgba(241,134,7,1)',
            fill: true,
            fillAndStroke: true,
            lineWidth: 1,
            fillColor: 'rgba(255,181,96,1)', // '#ff9920',
            markerOptions: {
                color: '#db7720' // 'rgba(241,134,7,1)'
            }
        }],
        highlighter: {
            sizeAdjust: 5
        },
        cursor: {
            lineColor: "#bb6ee5"
        }
    };

    var targetPlotOptions = {
        series: [{
            showMarker: false,
            neighborThreshold: 0
        }],
        legend: {
            show: true,
            location: 'nw',
            marginLeft: "10",
            marginTop: "10"
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.DateAxisRenderer,
                rendererOptions: {
                    tickInset: 0
                },
                tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                tickOptions: {
                  mark: 'inside'
                }
            },
            yaxis: {
                min: 0
            }
        },
        highlighter: {
            show: true,
            showMarker: true,
            tooltipAxes: 'xy',
            tooltipOffset: 10,
            formatString: "%s &bullet; %s"
        },
        cursor:{
            show: true,
            showVerticalLine: true,
            showTooltipDataPosition: false,
            showTooltipUnitPosition: false,
            showCursorLegend: true,
            cursorLegendFormatter: cursorLegendFormatter,
            cursorLegendFormatString: " ",
            tooltipFormatString: "<p style='display: none'>%s</p> %s: %s",
            tooltipLocation: 'nw',
            zoom: true,
            formatString: "%s",
            highlight: true
        }
    };

    var salsaControllerThemeExtension = {
        grid: {
            drawGridlines: false,
            backgroundColor: "#ffffff",
            borderColor: "rgb(100,55,124)"
        },
        series: [{
            color: "#cc5500", // '#db7720', // 'rgba(255,176,86,1)',
            fillColor: "#ffefd5", // 'rgb(255,255,150)',
            lineWidth: 1,
            fill: true, //,
            fillAndStroke: true
        }],
        cursor: {
            zoomOptions: {
                fillStyle: 'rgba(255,255,255,0.8)',
                strokeStyle: "rgb(100,100,124)",
                lineWidth: 2
            },
            dragHandle: {
                src: "/salsa/include/visualization/jqplot/plugins/dragIcon.gif"
            }
        }
    };

    var controllerPlotOptions = {
        series: [{
            showMarker: false,
            rendererOptions: {
                highlightMouseOver: false
            }
        }],
        axes: {
            xaxis: {
                renderer: $.jqplot.DateAxisRenderer,
                rendererOptions: {
                    tickInset: 0
                },
                tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                tickOptions: { showMark: false, showTicks: false, showLabel: false }
            },
            yaxis: {
                tickOptions: { showMark: false, showTicks: false, showLabel: false },
                min: 0
            }
        },
        cursor:{
            show: true,
            showTooltip: false,
            zoom: true,
            constrainZoomTo: 'x',
            zoomOptions: {
                scrollPercentage: 0.5
            }
        }
    };

    var salsaEventThemeExtension = {
        verticalLine: {
            color: "rgb(100,100,124)" // 'rgb(100, 55, 124)'
        }
    };

    var eventOptions = {
        verticalLine: {
            alwaysShowTooltip: true,
            ymin: 0,
            ymax: 2000,
            lineWidth: 3,
            shadow: false,
            lineCap: 'round',
            showTooltip: false,
            xOffset: '25'
        }
    };

    function hasMoreData (options) {
        return ((options.dataset.type == "ajax" && options.dataset.urls.length > 0) || (options.events && options.events.type == "ajax" && options.events.urls && options.events.urls.length > 0));
    }

    function load (options, type) {
        var urls = options[type].urls;
        var u = 0;

        options[type].data = options[type].data || [];

        if (urls.length > u) {
            for (var i = u, l = urls.length; i < l; i++) {
                if (!urls[i].inProgress) {
                    urls[i].inProgress = true;
                    retrieveData(urls[i], options, type);
                    break;
                }
            }
        } else {
            options[type].type = "data";
            $.jqplot.annotatedTimeline(options);
        }
    }

    function retrieveData (url, options) {

        var o = options;

        $.ajax({
            url: url,
            dataType: "jsonp",
            success: function (data,status,xhr) {
                var d = data.data;
                d.min = data.min;
                d.max = data.max;
                o.dataset.data.push(d);

                var idx = $.inArray(url, o.dataset.urls);
                if (idx >= 0) { o.dataset.urls.splice(idx,1); }

                $.jqplot.annotatedTimeline(o);
            },
            error: function (xhr,status,error) {

            }
        });
    }

    /*
    {
        container: "#container1",
        title: "Average",
        width: 700,
        height: 400,
        controllerHeight: 140,
        dataset: {
            type: "data",
            data: [[0,0]]
            },
        events: {
            type: "data",
            data: [["2011-12-23 03:15","Event 1","Event 1 Description"]]
            },
        xformat: "%s %s",
        yformat: "%s %s"
    }
     */
    $.jqplot.annotatedTimeline = function (options) {

        if (hasMoreData(options)) {

            if (options.dataset.urls && options.dataset.urls.length > 0) {
                load(options, "dataset");
            }
            if (options.events && options.events.urls && options.events.urls.length > 0) {
                load(options, "events");
            }

        } else {

            var overlay = {};
            var target = {
                id: "jqplot-statistics-annotatedtimeline-" + options.title.replace(/[^a-zA-Z0-9]/ig, "-"),
                "class": "jqplot-statistics-annotatedtimeline",
                style: "width: " + options.width + "px; height: " + options.height + "px;"
            };
            var controller = {
                id: "jqplot-statistics-annotatedtimeline-controller-" + options.title.replace(/[^a-z0-9]/ig, "-"),
                "class": "jqplot-statistics-annotatedtimeline-controller",
                style: "width: " + options.width + "px; height: " + (options.controllerHeight || 140) + "px;"
            };
            var container = $(options.container).append($("<div>", target)).append($("<div>", controller));

            var range = { min: options.dataset.data[0][0][0], max: options.dataset.data[0][options.dataset.data[0].length-1][0] };

            if (options.events && options.events.data && options.events.data.length > 0) {
                var events = options.events.data;

                var eventElem = {
                    id: "jqplot-statistics-annotatedtimeline-event-descriptions-" + options.title.replace(/[^a-zA-Z0-9]/ig, "-"),
                    "class": "jqplot-statistics-annotatedtimeline-event-descriptions"
                };
                container.append($("<div>", eventElem));

                for (var i = 0, l = options.events.length; i < l; i++) {
                    var event = options.events[i];

                    events.push($.extend(true, {
                        verticalLine: {
                          name: event[1].replace(/[^a-z0-9]/ig,"-"),
                          description: event[2],
                          tooltipFormatString: event[1],
                          x: event[0],
                          ymax: (options.dataset.max * 5)
                        }
                    }, eventOptions, salsaEventThemeExtension));
                }
                overlay = { canvasOverlay: { show: true, descriptionElement: "#" + eventElem.id, objects: events }};
            }

            var targetPlotOpts = $.extend(true, {
                title: {
                    text: options.title
                },
                axes: {
                    xaxis: { min: range.min, max: range.max, tickOptions: { formatString: options.xformat } },
                    yaxis: { tickOptions: { formatString: options.yformat } }
                }
            }, targetPlotOptions, salsaThemeExtension, overlay, options.targetOptions || {});

            var targetPlot = $.jqplot(target.id, options.dataset.data, targetPlotOpts);

            var controllerPlotOpts = $.extend(true, {
                axes: { xaxis: { min: range.min, max: range.max } }
            }, controllerPlotOptions, salsaControllerThemeExtension, options.controllerOptions || {});

            var controllerPlot = $.jqplot(controller.id, options.dataset.data, controllerPlotOpts);
            $.jqplot.Cursor.zoomProxy(targetPlot, controllerPlot, true);
        }
    };

})(jQuery);