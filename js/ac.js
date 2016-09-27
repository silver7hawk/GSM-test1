 $(document).ready(function () {
                        var chartConfig = {
                            containerId: 'chartComp',
                            symbol: 'XAGUSD^A', //the symbol of the default instrument when chart is loaded
                            name: 'Silver USD', //the name of the default instrument
                            provider: 'netdania_fxa2', //the provider of the default instrument
                            timescale: 1, //default timescale
                            numberOfPoints: 1000, // the default number of points loaded: maximum 1000
                            //the instruments array
                            instruments: ['XAUUSD^A|Gold $|netdania_fxa2|2', 'XAGUSD^A|Silver $|netdania_fxa2|2', 'XAUXAG^A|Gold/Silver $ Ratio|netdania_fxa2|2'],
                            studies: { RSI: 'Relative Strength Index', ROC: 'Rate of Change', ATR: 'Average True Range' },
                            //instrumentsOverlay //optional
                            //instrumentsRelativeTo //optional
                            chartType: 'line', //type of the default chart: line, heikinAshi, barOHLC, dot, lineDot, forest, barHLC, candleStick
                            update: true,
                            height: 251,
                            width: 400,
                            showLabel: true,
                            showZoomBottomBar: false, //whether to show or not th zoom bar by default
                            defaultZoomNumberOfPoints: 59, //the number of points that are initially shown on the chart
                            showTooltip: true,
                            useMovingTooltip: false, //whether the tooltip on the chart should follow mouse or not
                            tooltipLocation: 'nw'//where to display the tooltip
                            , padding: 0
                            , showTopToolbar: true
                            , showBottomToolbar: true
                            , showThemeToolbar: false
                            , showInstrumentsMenu: true
                            , showChartTypeMenu: true
                            , showViewMenu: false
                            , showOverlayMenu: false
                            , showRelativeMenu: false
                            , showStudiesMenu: false
                            , showVolumeButton: false
                            , showZoomButton: false
                            , showPrintButton: false
                            , showFullButton: false
                            , showTrendlineMenu: 'false|false'
                            , hideIndicators: true
                            , yAxisSymbol: ' &#36;'
                            , toolbarTimescales: ['Tick|0|960', '1 Minute|1|1000', 'Hourly|60|7', 'Daily|1440|10', 'Weekly|10080|7', 'Monthly|43200|12']
                            //,defaultTheme: 'Smoothness',//can be 'Start', 'UI darkness', 'UI lightness', 'Smoothness'; if non is specified default is 'UI Darkness',

                            , timescaleFormat: ['h:MM TT', 'h:MM TT', 'h:MM TT', 'mm/dd/yy'] //1)ticks; 2)1; 3)0, 1, 5, 10, 30, 60, 120, 240; 3)
                        }

                        Netdania.scriptsLoaded = true;
                        Netdania.RenderChart(chartConfig);
                        //Netdania.RenderChart(chartConfig);


                    });
              