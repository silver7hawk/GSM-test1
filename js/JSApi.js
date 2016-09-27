var JSON; if (!JSON) { JSON = {} } (function () { function f(n) { return n < 10 ? "0" + n : n } if (typeof Date.prototype.toJSON !== "function") { Date.prototype.toJSON = function (key) { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null }; String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) { return this.valueOf() } } var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, rep; function quote(string) { escapable.lastIndex = 0; return escapable.test(string) ? '"' + string.replace(escapable, function (a) { var c = meta[a]; return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + string + '"' } function str(key, holder) { var i, k, v, length, mind = gap, partial, value = holder[key]; if (value && typeof value === "object" && typeof value.toJSON === "function") { value = value.toJSON(key) } if (typeof rep === "function") { value = rep.call(holder, key, value) } switch (typeof value) { case "string": return quote(value); case "number": return isFinite(value) ? String(value) : "null"; case "boolean": case "null": return String(value); case "object": if (!value) { return "null" } gap += indent; partial = []; if (Object.prototype.toString.apply(value) === "[object Array]") { length = value.length; for (i = 0; i < length; i += 1) { partial[i] = str(i, value) || "null" } v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]"; gap = mind; return v } if (rep && typeof rep === "object") { length = rep.length; for (i = 0; i < length; i += 1) { if (typeof rep[i] === "string") { k = rep[i]; v = str(k, value); if (v) { partial.push(quote(k) + (gap ? ": " : ":") + v) } } } } else { for (k in value) { if (Object.prototype.hasOwnProperty.call(value, k)) { v = str(k, value); if (v) { partial.push(quote(k) + (gap ? ": " : ":") + v) } } } } v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}"; gap = mind; return v } } if (typeof JSON.stringify !== "function") { JSON.stringify = function (value, replacer, space) { var i; gap = ""; indent = ""; if (typeof space === "number") { for (i = 0; i < space; i += 1) { indent += " " } } else { if (typeof space === "string") { indent = space } } rep = replacer; if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) { throw new Error("JSON.stringify") } return str("", { "": value }) } } if (typeof JSON.parse !== "function") { JSON.parse = function (text, reviver) { var j; function walk(holder, key) { var k, v, value = holder[key]; if (value && typeof value === "object") { for (k in value) { if (Object.prototype.hasOwnProperty.call(value, k)) { v = walk(value, k); if (v !== undefined) { value[k] = v } else { delete value[k] } } } } return reviver.call(holder, key, value) } text = String(text); cx.lastIndex = 0; if (cx.test(text)) { text = text.replace(cx, function (a) { return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) }) } if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) { j = eval("(" + text + ")"); return typeof reviver === "function" ? walk({ "": j }, "") : j } throw new SyntaxError("JSON.parse") } } }());

(function (global) {
    var SETTIMEOUT = global.setTimeout, // for better compression
            doc = global.document,
            callback_counter = 0;

    global.jXHR = function () {
        var script_url,
                script_loaded,
                jsonp_callback,
                scriptElem,
                publicAPI = null;

        function removeScript() { try { scriptElem.parentNode.removeChild(scriptElem); } catch (err) { } }

        function reset() {
            script_loaded = false;
            script_url = "";
            removeScript();
            scriptElem = null;
            fireReadyStateChange(0);
        }

        function ThrowError(msg) {
            try {
                publicAPI.onerror.call(publicAPI, msg, script_url);
            } catch (err) { throw new Error(msg); }
        }

        function handleScriptLoad() {
            if ((this.readyState && this.readyState !== "complete" && this.readyState !== "loaded") || script_loaded) { return; }
            this.onload = this.onreadystatechange = null; // prevent memory leak
            script_loaded = true;
            if (publicAPI.readyState !== 4) {
                ThrowError("Script failed to load [" + script_url + "].");
            };
            removeScript();
        }

        function handleScriptFail() {
            if (!script_loaded) {
                ThrowError("Script failed to load [" + script_url + "], most probably due to an invalid URL or server error.")
            }
        }

        function fireReadyStateChange(rs, args) {
            args = args || [];
            publicAPI.readyState = rs;
            if (typeof publicAPI.onreadystatechange === "function") {
                publicAPI.onreadystatechange.apply(publicAPI, args);
            }
        }

        publicAPI = {
            onerror: null,
            onreadystatechange: null,
            readyState: 0,
            open: function (method, url) {
                reset();
                internal_callback = "cb" + (callback_counter++);
                (function (icb) {
                    global.jXHR[icb] = function () {
                        try { fireReadyStateChange.call(publicAPI, 4, arguments); }
                        catch (err) {
                            publicAPI.readyState = -1;
                            ThrowError("Script failed to run [" + script_url + "].");
                        }
                        global.jXHR[icb] = null;
                    };
                })(internal_callback);
                script_url = url.replace(/=\?/, "=jXHR." + internal_callback);
                fireReadyStateChange(1);
            },
            send: function () {
                SETTIMEOUT(function () {
                    scriptElem = doc.createElement("script");
                    scriptElem.setAttribute("type", "text/javascript");
                    scriptElem.onload = scriptElem.onreadystatechange = function () { handleScriptLoad.call(scriptElem); };
                    scriptElem.setAttribute("src", script_url);
                    doc.getElementsByTagName("head")[0].appendChild(scriptElem);
                    scriptElem.onerror = function () {
                        handleScriptFail.call(scriptElem);
                    };
                }, 0);
                fireReadyStateChange(2);

            },
            setRequestHeader: function () { }, // noop
            getResponseHeader: function () { return ""; }, // basically noop
            getAllResponseHeaders: function () { return []; } // ditto
        };

        reset();

        return publicAPI;
    };
})(window);

Netdania = {};
Netdania.JsApi = {};
Netdania.JsApi.Utilities = {};
Netdania.JsApi.Response = {};
Netdania.JsApi.Request = {};


Netdania.JsApi.Utilities.ua = navigator.userAgent.toLowerCase();
if (Netdania.JsApi.Utilities.ua.indexOf(" chrome/") >= 0 || Netdania.JsApi.Utilities.ua.indexOf(" firefox/") >= 0 || Netdania.JsApi.Utilities.ua.indexOf(' gecko/') >= 0) {
    Netdania.JsApi.StringMaker = function () {
        this.str = "";
        this.length = 0;
        this.append = function (s) {
            this.str += s;
            this.length += s.length;
        };
        this.prepend = function (s) {
            this.str = s + this.str;
            this.length += s.length;
        };
        this.toString = function () {
            return this.str;
        };
    };
} else {
    Netdania.JsApi.StringMaker = function () {
        this.parts = [];
        this.length = 0;
        this.append = function (s) {
            this.parts.push(s);
            this.length += s.length;
        };
        this.prepend = function (s) {
            this.parts.unshift(s);
            this.length += s.length;
        };
        this.toString = function () {
            return this.parts.join('');
        };
    };
}

Netdania.JsApi.Utilities.keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.";
//var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
Netdania.JsApi.encode64 = function (input) {
    var output = new Netdania.JsApi.StringMaker();
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output.append(Netdania.JsApi.Utilities.keyStr.charAt(enc1) + Netdania.JsApi.Utilities.keyStr.charAt(enc2) + Netdania.JsApi.Utilities.keyStr.charAt(enc3) + Netdania.JsApi.Utilities.keyStr.charAt(enc4));
    }

    return output.toString();
}

Netdania.JsApi.decode64 = function (input) {
    var output = new StringMaker();
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    input = input.replace(/[^A-Za-z0-9\-\_\.]/g, "");
    //input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
        enc1 = Netdania.JsApi.Utilities.keyStr.indexOf(input.charAt(i++));
        enc2 = Netdania.JsApi.Utilities.keyStr.indexOf(input.charAt(i++));
        enc3 = Netdania.JsApi.Utilities.keyStr.indexOf(input.charAt(i++));
        enc4 = Netdania.JsApi.Utilities.keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output.append(String.fromCharCode(chr1));

        if (enc3 != 64) {
            output.append(String.fromCharCode(chr2));
        }
        if (enc4 != 64) {
            output.append(String.fromCharCode(chr3));
        }
    }

    return output.toString();
}

Netdania.JsApi.Request.getReqObjPrice = function (strSymbol, strProvider, boolMonitor) {
    var newReqId = ++Netdania.JsApi.globalCurrentReqId;
    var tempReqObj = {
        t: 1, // unsigned byte for message type (REQUEST_MONITOR_PRICE = 1)
        i: newReqId, // int indicating the request id
        m: boolMonitor ? 1 : 0, // byte indicating subscription mode (SUBSCRIPTION_MODE_SNAPSHOT=0, SUBSCRIPTION_MODE_MONITOR=1)
        s: strSymbol,
        p: strProvider
    };
    return tempReqObj;
}

Netdania.JsApi.Request.getReqObjChart = function (strSymbol, intTimeScale, intPoints, strProvider, boolMonitor) {
    var newReqId = ++Netdania.JsApi.globalCurrentReqId;
    var tempReqObj = {
        t: 2, // unsigned byte for message type (REQUEST_MONITOR_CHART = 2)
        i: newReqId, // int indicating the request id
        m: boolMonitor ? 1 : 0, // byte indicating subscription mode (SUBSCRIPTION_MODE_SNAPSHOT=0, SUBSCRIPTION_MODE_MONITOR=1)
        s: strSymbol,
        p: strProvider,
        ts: intTimeScale,
        pt: intPoints
    };
    return tempReqObj;
}

Netdania.JsApi.Request.getReqObjRemove = function (intReqId) {
    var tempReqObj = {
        t: 5, // unsigned byte for message type (REQUEST_REMOVE = 5)
        i: intReqId // int indicating the request id (of request to remove)
    };
    return tempReqObj;
}

Netdania.JsApi.Request.getReqObjHeadlines = function(strSource, intMax, strProvider, boolMonitor) {
    var newReqId = ++Netdania.JsApi.globalCurrentReqId;
    var tempReqObj = {
        t: 3, // unsigned byte for message type (REQUEST_MONITOR_HEADLINES = 3)
        i: newReqId, // int indicating the request id
        m: boolMonitor ? 1 : 0, // byte indicating subscription mode (SUBSCRIPTION_MODE_SNAPSHOT=0, SUBSCRIPTION_MODE_MONITOR=1)
        s: strSource,
        p: strProvider,
        max: intMax
    };
    return tempReqObj;
}

Netdania.JsApi.Request.getReqObjStory = function(strStoryId, strProvider) {
    var newReqId = ++Netdania.JsApi.globalCurrentReqId;
    var tempReqObj = {
        t: 4, // unsigned byte for message type (REQUEST_NEWS_STORY = 4)
        i: newReqId, // int indicating the request id
        s: strStoryId,
        p: strProvider
    };
    return tempReqObj;
}

Netdania.JsApi.Request.getReqObjInstrumentLookup = function(strMarketId, byteSearchField, strSearch, byteMode, arrInstrTypes, intMax, strProvider) {
    var newReqId = ++Netdania.JsApi.globalCurrentReqId;
    var tempReqObj = {
        t: 9, // unsigned byte for message type (REQUEST_MARKET_INSTRUMENTS = 9)
        i: newReqId, // int indicating the request id
        p: strProvider,
        mkt: strMarketId, // A String for market id
        fid: byteSearchField, // A byte for search field (SEARCH_ALL = 0, SEARCH_NAME = 1, SEARCH_SYMBOL = 2)
        str: strSearch, // String for string to search for
        mode: byteMode, // byte for search mode (MODE_STARTS_WITH = 1, MODE_CONTAINS = 2, MODE_ENDS_WITH = 3)
        it: arrInstrTypes, // byte for instrument type (in fact this is an array of instrument-types/bytes - extended compared to binary protocol v1)
        max: intMax // int for maximum number of results
    };
    return tempReqObj;
}

Netdania.JsApi.Request.getReqObjNewsSearch = function(strSource, strSearch, intMax, intStartTime, intEndTime, byteSearchIn, strProvider) {
    var newReqId = ++Netdania.JsApi.globalCurrentReqId;
    var tempReqObj = {
        t: 10, // unsigned byte for message type (REQUEST_NEWS_SEARCH = 10)
        i: newReqId, // int indicating the request id
        s: strSource, // A String for the news source
        str: strSearch, // A string for search string
        max: intMax, // Unsigned short for max number of results
        st: intStartTime, // int for start date (seconds)
        et: intEndTime, // int for end date (seconds)
        f: byteSearchIn, // Byte for field to search in (0=all, 1=headlines only, 2=stories only)
        p: strProvider
    };
    return tempReqObj;
}

Netdania.JsApi.Response.MonitorChartResponse = function (data, type, id) {
    var tempResObj = {
        type: type,
        id: id,
        data: data,
        get: function (fieldId) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].f == fieldId) {
                    return data[i].v;
                }
            }
            return null;
        },
        getDecimals: function (fieldId) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].f == fieldId) {
                    return data[i].d;
                }
            }
            return 0;
        }
    };
    return tempResObj;
}

Netdania.JsApi.Response.ChartUpdateResponse = function (data, type, id, timestamp) {
    var tempResObj = {
        type: type,
        id: id,
        data: data,
        ts: timestamp,
        getClose: function () {
            for (var i = 0; i < data.length; i++) {
                if (data[i].f == Netdania.JsApi.Fields.CHART_CLOSE) {
                    return data[i].v;
                }
            }
            return 'N/A';
        },
        getVolume: function () {
            for (var i = 0; i < data.length; i++) {
                if (data[i].f == Netdania.JsApi.Fields.CHART_VOLUME) {
                    return data[i].v;
                }
            }
            return 'N/A';
        }
    };
    tempResObj.close = tempResObj.getClose();
    tempResObj.volume = tempResObj.getVolume();
    return tempResObj;
}

Netdania.JsApi.Response.MonitorPriceResponse = function (data, type, id) {
    var tempResObj = {
        type: type,
        id: id,
        data: data,
        modifiedFids: [],
        getFIDs: function(){
            var fids = [];
            for (var i = 0; i < data.length; i++) {
                fids.push(data[i].f);
            }
            modifiedFids = fids;
            return modifiedFids;
        },
        get: function (fid) {
            if (this.getFIDs(data).contains(fid)) {
                for (var i = 0; i < data.length; i++) {
                    if(data[i].f === fid){
                        return data[i].v;
                    }
                }
            }else{
                return 'N/A';
            }
        }
    };
    tempResObj.modifiedFids = tempResObj.getFIDs();
    return tempResObj;
}

Netdania.JsApi.Response.NewsHistoryResponse = function (data, type, id) {
    var tempResObj = {
        type: type,
        id: id,
        data: data
    };
    return tempResObj;
}

Netdania.JsApi.Response.LookupResponse = function (data, type, id) {
    var tempResObj = {
        type: type,
        id: id,
        data: data
    };
    return tempResObj;
}

Netdania.JsApi.Response.MonitorNewsResponse = function (data, type, id) {
    var tempResObj = {
        type: type,
        id: id,
        data: data
    };
    return tempResObj;
}

Netdania.JsApi.Response.NewsStoryResponse = function (data, type, id) {
    var tempResObj = {
        type: type,
        id: id,
        data: data
    };
    return tempResObj;
}

Netdania.JsApi.Response.NewsSearchResponse = function (data, type, id) {
    var tempResObj = {
        type: type,
        id: id,
        data: data
    };
    return tempResObj;
}


Netdania.JsApi.Response.GeneralMonitorResponse = function (data, type, id) {
    var tempResObj = {
        type: type,
        id: id,
        data: data
    };
    return tempResObj;
}

Netdania.JsApi.getXReqPageSize = function () {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf(" chrome/") >= 0 || ua.indexOf(" firefox/") >= 0 || ua.indexOf(' gecko/') >= 0) {
        return 20;
    }
    var i = ua.indexOf("msie");
    if (i >= 0) {
        try {
            if (parseFloat(ua.substring(i + 4)) > 7) {
                return 20;
            }
        } catch (e) { }
    }
    return 4;
}


Netdania.JsApi.unpackChartSeries = function (strEncoded, intDecimals) {
    var strArray = strEncoded.split(",");
    var arrDeltaDecoded = new Array(strArray.length);
    var doubleDivide = Math.pow(10, intDecimals);

    var intT = 0;
    var intOriginal;
    for (var i = 0; i < strArray.length; i++) {
        intOriginal = parseInt(strArray[i], 36) + intT;
        arrDeltaDecoded[i] = intOriginal / doubleDivide;
        intT = intOriginal;
    }
    strArray = doubleDivide = null;

    return arrDeltaDecoded;
}

Netdania.JsApi.Utilities.GetHost = function () {
    return window.location.hostname;
}
Netdania.JsApi.Utilities.GetURL = function () {
    return window.location.hostname;
}

Netdania.JsApi.Events = {
    ONCONNECTED: 'OnConnected',
    ONUPDATE: 'OnUpdate',
    ONRAWUPDATE: 'OnRawUpdate',
    ONDISCONNECTED: 'OnDisconnected',
    ONINIT: 'OnInit',
    ONRECONNECTED: 'OnReconnect',
    ONPRICEUPDATE: 'OnPriceUpdate',
    ONCHARTUPDATE: 'OnChartUpdate',
    ONHISTORICALDATA: 'OnHistoricalData',
    ONERROR: 'OnError',
    ONINFO: 'OnInfo',
    ONLOOKUP: 'OnLookup',
    ONHISTORICALHEADLINES: 'OnHistHeadlines',
    ONHEADLINEUPDATE: 'OnHeadlineUpdate',
    ONNEWSSTORY: 'OnNewsHist',
    ONNEWSSEARCH: 'OnNewsSearch'
}


Netdania.JsApi.ConnectionType = {
    POLLING: '3', //'2',
    LONGPOLLING: '3'
    //,STREAMING: '1'
}

Netdania.JsApi.globalCurrentReqId = 0;
Netdania.JsApi.sessionId = "";

Netdania.JsApi.JSONConnection = function (config) {

    if (Netdania.JsApi.sessionId) {
        return;
    }
    this.Observer = new Netdania.UpdatesObserver();
    var self = this;

    this.xreqPageSize = Netdania.JsApi.getXReqPageSize();
    this.pollingInterval = config.pollingInterval >= 1000 ? config.pollingInterval : 1000;
    this.globalConnectHost = config.host;
    this.byteConnBehavior = config.behavior;
    this.byteDeliveryType = config.type;
    this.isConnected = false;
    this.requestList = [];
    this.requestQueue = [];
    Events.enable.call(this);

    this.Connect = function (isReconnect) {

        this.fireEvent(Netdania.JsApi.Events.ONINFO, ['connecting...']);
        this.handshake = {
            g: Netdania.JsApi.Utilities.GetHost(),
            ai: "jsapi-" + Netdania.JsApi.Utilities.GetHost(),
            pr: this.byteConnBehavior,
            au: Netdania.JsApi.Utilities.GetURL()
        };
        var strHandshake = Netdania.JsApi.encode64(JSON.stringify(this.handshake));

        var url = this.globalConnectHost + "?" +
                    "xstream=1&" +
                    "v=1&" +
                    "dt=1&" +
                    "h=" + strHandshake + "&" +
        //"xcmd=" + strArrRequests + "&" +
                    "cb=?" +
                    "&ts=" + Math.random();

        this.xreq = new jXHR();
        this.xreq.pending = false;
        this.xreq.totalCount = -1;

        if (isReconnect) {
            self.xreq.pending = true;
        }

        this.xreq.onerror = function (msg, url) {
            self.fireEvent(Netdania.JsApi.Events.ONDISCONNECTED, [msg, url]);
            self.xreq.pending = false;
            self.isConnected = false;
            Reconnect();
        };

        this.xreq.onreadystatechange = function (data) {
            if (self.xreq.readyState === 4) {

                Netdania.JsApi.sessionId = data[1].m;
                self.sessionId = data[1].m;
                self.xreq.url = self.globalConnectHost + "?" +
                        "dt=" + self.byteDeliveryType + "&" +
                        "sessid=" + self.sessionId + "&" +
                        "cb=?&" +
                        "xpoll&" +
                        "ts=" + Math.random();
                self.isConnected = true;
                self.fireEvent(Netdania.JsApi.Events.ONCONNECTED, [self.sessionId]);
                if (isReconnect) {
                    var temp = self.requestList;
                    self.requestList = [];
                    self.appendRequests(temp);
                    
                    self.xreq.pending = false;
                }
                if (self.requestQueue.length > 0) {
                    self.appendRequests(self.requestQueue);
                    self.requestQueue = [];
                }
                self.xreq.onreadystatechange = function (data) {
                    if (self.xreq.readyState === 4) {
                        self.callback(data);
                        if (self.byteConnBehavior === Netdania.JsApi.ConnectionType.LONGPOLLING) {
                            setTimeout(doPolling, self.pollingInterval);
                        }
                    }
                };
                setTimeout(doPolling, 50);
                if (self.byteConnBehavior === Netdania.JsApi.ConnectionType.POLLING) {
                    self.xreq.polling = setInterval(doPolling, self.pollingInterval);
                }
            }
        };
        this.xreq.open("GET", url);
        this.xreq.send();
    }

    var Reconnect = function () {
        setTimeout(function () {
            self.fireEvent(Netdania.JsApi.Events.ONINFO, ["reconnect..."]);
            if (self.xreq.pending === false && !self.isConnected) {
                clearInterval(self.xreq.polling);
                self.xreq = null;
                self.Connect(true);
            }
        }, 1000);
    }

    var doPolling = function () {

        if (!self.isConnected) {
            Reconnect();
        }

        if (self.xreq.pending === false) {
            self.xreq.pending = true;
            self.xreq.open("GET", self.xreq.url);
            self.xreq.send();
        }
    }


    this.callback = function (data) {
        if (data !== '' && data !== undefined) {
            self.fireEvent(Netdania.JsApi.Events.ONRAWUPDATE, [data]);
            for (var i = 0; i < data.length; i++) {
                if (data[i].t == 4) {
                    var dt = data[i].f;
                    for (var j = 0; j < dt.length; j++) {
                        var intFid = dt[j].f;
                        switch (intFid) {
                            case 107:
                            case 108:
                                break;
                            default:
                                dt[j].v = Netdania.JsApi.unpackChartSeries(dt[j].v, dt[j].d);
                                break;
                        }
                    }
                    var monitorChartResponse = Netdania.JsApi.Response.MonitorChartResponse(dt, data[i].t, data[i].i);
                    //self.Observer.update(monitorChartResponse);
                    self.Observer.init(dt, data[i].i);
                    self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, "", data[i].i, data[i].t]);
                    self.fireEvent(Netdania.JsApi.Events.ONHISTORICALDATA, [monitorChartResponse]);
                    self.fireEvent(Netdania.JsApi.Events.ONINFO, ['historical data...']);
                    dt = null;
                }
                else if (data[i].t == 2) {
                    try {
                        var dt = data[i].f;
                        var monitorPriceResponse = Netdania.JsApi.Response.MonitorPriceResponse(dt, data[i].t, data[i].i);
                        //self.Observer.update(monitorPriceResponse);
                        self.Observer.update(dt, "", data[i].i, data[i].t);
                        self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, "", data[i].i, data[i].t]);
                        self.fireEvent(Netdania.JsApi.Events.ONPRICEUPDATE, [monitorPriceResponse]);
                        self.fireEvent(Netdania.JsApi.Events.ONINFO, ['price update...']);
                        dt = null;
                        rt = null;

                    } catch (ex) { }
                }
                else if (data[i].t == 18) {
                    try {
                        var dt = data[i].f;
                        var rt = data[i].rt;
                        var chartUpdateResponse = Netdania.JsApi.Response.ChartUpdateResponse(dt, data[i].t, data[i].i, rt);
                        //self.Observer.update(chartUpdateResponse);
                        self.Observer.update(dt, rt, data[i].i, data[i].t);
                        self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, rt, data[i].i, data[i].t]);
                        self.fireEvent(Netdania.JsApi.Events.ONCHARTUPDATE, [chartUpdateResponse]);
                        self.fireEvent(Netdania.JsApi.Events.ONINFO, ['chart update...']);
                        dt = null;
                        rt = null;

                    } catch (ex) { }
                }
                else if (data[i].t == 6) {
                    try {
                        var dt = data[i].h;
                        //var rt = data[i].rt;
                        var newsHistoryResponse = Netdania.JsApi.Response.NewsHistoryResponse(dt, data[i].t, data[i].i);
                        //self.Observer.update(newsHistoryResponse);
                        self.Observer.update(dt, "", data[i].i, data[i].t);
                        self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, "", data[i].i, data[i].t]);
                        self.fireEvent(Netdania.JsApi.Events.ONHISTORICALHEADLINES, [newsHistoryResponse]);
                        self.fireEvent(Netdania.JsApi.Events.ONINFO, ['historical headlines...']);
                        dt = null;
                        rt = null;

                    } catch (ex) { }
                }

                else if (data[i].t == 19) {
                    try {
                        var dt = data[i].h;
                        //var rt = data[i].rt;
                        var monitorNewsResponse = Netdania.JsApi.Response.MonitorNewsResponse(dt, data[i].t, data[i].i);
                        //self.Observer.update(monitorNewsResponse);
                        self.Observer.update(dt, "", data[i].i, data[i].t);
                        self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, "", data[i].i, data[i].t]);
                        self.fireEvent(Netdania.JsApi.Events.ONHEADLINEUPDATE, [monitorNewsResponse]);
                        self.fireEvent(Netdania.JsApi.Events.ONINFO, ['headline update...']);
                        dt = null;
                        rt = null;

                    } catch (ex) { }
                }
                else if (data[i].t == 8) {
                    try {
                        var dt = data[i].s;
                        var rt = data[i].rt;
                        var newsStoryResponse = Netdania.JsApi.Response.NewsStoryResponse(dt, data[i].t, data[i].i);
                        //self.Observer.update(monitorNewsResponse);
                        self.Observer.update(dt, rt, data[i].i, data[i].t);
                        self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, rt, data[i].i, data[i].t]);
                        self.fireEvent(Netdania.JsApi.Events.ONNEWSSTORY, [newsStoryResponse]);
                        self.fireEvent(Netdania.JsApi.Events.ONINFO, ['news story...']);
                        dt = null;
                        rt = null;

                    } catch (ex) { }
                }
                else if (data[i].t == 15) {
                    try {
                        var dt = data[i].h;
                        //var rt = data[i].rt;
                        var newsSearchResponse = Netdania.JsApi.Response.NewsSearchResponse(dt, data[i].t, data[i].i);
                        //self.Observer.update(monitorNewsResponse);
                        self.Observer.update(dt, data[i].t, data[i].i);
                        self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, "", data[i].i, data[i].t]);
                        self.fireEvent(Netdania.JsApi.Events.ONNEWSSEARCH, [newsSearchResponse]);
                        self.fireEvent(Netdania.JsApi.Events.ONINFO, ['news search...']);
                        dt = null;
                        rt = null;

                    } catch (ex) { }
                }
                else if (data[i].t == 13) {
                    try {
                        var dt = data[i].a;
                        //var rt = data[i].rt;
                        var lookupResponse = Netdania.JsApi.Response.LookupResponse(dt, data[i].t, data[i].i);
                        //self.Observer.update(lookupResponse);
                        self.Observer.update(dt, "", data[i].i, data[i].t);
                        self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, "", data[i].i, data[i].t]);
                        self.fireEvent(Netdania.JsApi.Events.ONLOOKUP, [lookupResponse]);
                        self.fireEvent(Netdania.JsApi.Events.ONINFO, ['lookup...']);
                        dt = null;
                        rt = null;

                    } catch (ex) { }
                }
                else {
                    try {
                        var dt = data[i].f || data[i].h || data[i].s || data[i].a;
                        var rt = data[i].rt;

                        var generalMonitorResponse = Netdania.JsApi.Response.GeneralMonitorResponse(dt, data[i].t, data[i].i);
                        //self.Observer.update(generalMonitorResponse);
                        self.Observer.update(dt, rt, data[i].i, data[i].t);
                        self.fireEvent(Netdania.JsApi.Events.ONUPDATE, [dt, rt, data[i].i, data[i].t]);
                        dt = null;
                        rt = null;

                    } catch (ex) { }
                }
            }
        }
        this.xreq.pending = false;
        data = null;
    }


    this.removeRequests = function (v) {
        if (v === undefined) { return; }
        var rv = [];
        for (var i = 0; i < v.length; i++) {
            rv.push(Netdania.JsApi.Request.getReqObjRemove(v[i]));
        }

        this.appendRequests(rv);
        rv = null;
    }

    this.appendRequests = function (requestArray) {

        if (!this.isConnected) {
            this.requestQueue = requestArray;
            return;
        }
        if (requestArray === undefined || requestArray.length === 0) {
            return;
        }

        if (this.xreq === undefined || Netdania.JsApi.sessionId === undefined) {
            this.Connect();
        }

        requestInstrument(requestArray);
    }

    var cleanArray = function (arr) {
        //remove t = 5
        var requestIds = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].t == 5) requestIds.push(arr[i].i);
        }
        var newArr = [];
        if (requestIds.length > 0) {
            for (i = 0; i < arr.length; i++) {
                if (requestIds.indexOf(arr[i].i) == -1) newArr.push(arr[i]);
            }
            arr = newArr;
        }
        return arr;
    }

    var requestInstrument = function (requestArray) {

        if (requestArray.length > 0) {

            var treq = new jXHR();

            var tmpArr = requestArray.slice(0, self.xreqPageSize);
            requestArray = requestArray.slice(self.xreqPageSize, requestArray.length);

            var encodedReq = Netdania.JsApi.encode64(JSON.stringify(tmpArr));

            self.requestList = self.requestList.concat(tmpArr);
            self.requestList = cleanArray(self.requestList);

            var url = self.globalConnectHost + "?" +
                        "dt=" + self.byteDeliveryType + "&" +
                        "sessid=" + Netdania.JsApi.sessionId + "&" +
                        "xcmd=" + encodedReq + "&" +
                        "cb=?";
            treq.open("GET", url);
            treq.send();
            tmpArr = null;
            treq = null;
        }

        if (requestArray.length > 0) { setTimeout(function () { requestInstrument(requestArray) }, 50) };
    }
}


if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();

        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                fun.call(thisp, this[i], i, this);
        }
    };
}

if (!Array.prototype.contains) {
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }
}

Netdania.UpdatesObserver = function () {
    this.components = [];
}

Netdania.UpdatesObserver.prototype = {
    subscribe: function (component) {
        this.components.push(component);
    },

    unsubscribe: function (component) {
        this.components = this.components.filter(
    function (el) {
        if (el !== component) {
            return el;
        }
    }
);
    },

    update: function (dt, rt, id, thisObj) {
        var scope = thisObj || window;
        this.components.forEach(
    function (el) {
        if ($.inArray(id, el.ids) > -1) {
            el.update(dt, rt, id);
        }
    }
);
    },

    init: function (arrSeries, id, thisObj) {
        var scope = thisObj || window;

        this.components.forEach(
    function (el) {
        //if (el.id == id) {
        if ($.inArray(id, el.ids) > -1) {
            el.init(arrSeries, id);
        }
    }
);
    }
};

var Events = {};
(function () {
    Events = /** @lends Events */{
        /**
         * Enables event consumption and management on the provided class. This
         * needs to be called from the context of the object in which events are
         * to be enabled.
         * 
         * @public
         * @example
         * var MyObj = function() {
         *     var self = this;
         *     this.init = function() {
         *         Events.enable.call(self);
         *     };
         *     
         *     this.log = function() {
         *         console.log(self);
         *         self.fireEvent('log');
         *     };
         *
         *     this.init();
         * };
         *
         * var o = new MyObj();
         * o.addListener('log', function() { console.log('Event fired!'); });
         * o.log();
         */
        enable: function () {
            var self = this;
            self.listeners = {};

            // Fire event
            self.fireEvent = function (ev, args) {
                Events.fireEvent.call(self, ev, args);
            };

            // Add listener
            self.addListener = function (ev, fn) {
                Events.addListener.call(self, ev, fn);
            };

            // Remove listener
            self.removeListener = function (ev, fn) {
                Events.removeListener.call(self, ev, fn);
            }
        },

        /**
         * Fires the provided <code>ev</code> event and executes all listeners attached
         * to it. If <code>args</code> is provided, they will be passed along to the
         * listeners.
         *
         * @public
         * @param {string} ev The name of the event to fire
         * @param {array} args Optional array of args to pass to the listeners
         */
        fireEvent: function (ev, args) {
            if (!!this.listeners[ev]) {
                for (var i = 0; i < this.listeners[ev].length; i++) {
                    var fn = this.listeners[ev][i];
                    fn.apply(window, args);
                }
            }
        },

        /**
         * Binds the execution of the provided <code>fn</code> when the <code>ev</code> is fired.
         *
         * @public
         * @param {string} ev The name of the event to bind
         * @param {function} fn A function to bind to the event
         */
        addListener: function (ev, fn) {
            // Verify we have events enabled
            if (!this.listeners) {
                Events.enable.call(this, ev);
            }
            if (!this.listeners[ev]) {
                this.listeners[ev] = [];
            }

            if (fn instanceof Function) {
                this.listeners[ev].push(fn);
            }
        },

        /**
         * Removes the provided <code>fn</code> from the <code>ev</code>. If no function is
         * provided, all listeners for this event are removed.
         *
         * @public
         * @param {string} ev The name of the event to unbind
         * @param {function} fn An optional listener to be removed
         */
        removeListener: function (ev, fn) {
            if (!!this.listeners[ev] && this.listeners[ev].length > 0) {
                // If a function is provided, remove it
                if (!!fn) {
                    var new_fn = [];
                    for (var i = 0; i < this.listeners[ev].length; i++) {
                        if (this.listeners[ev][i] != fn) {
                            new_fn.push(this.listeners[ev][i]);
                        }
                    }
                    this.listeners[ev] = new_fn;
                } else { // Otherwise, remove them all
                    this.listeners[ev] = [];
                }
            }
        }
    };
}());


Netdania.JsApi.Fields = {
    ALLOWED_CHART_TIME_SCALES: [0, 1, 5, 10, 15, 30, 60, 120, 240, 480, 1440, 10080, 43200],
    CHART_TIME_STAMP: 100,
    /** Chart open series */
    CHART_OPEN: 101,
    /** Chart high series */
    CHART_HIGH: 102,
    /** Chart low series */
    CHART_LOW: 103,
    /** Chart close series */
    CHART_CLOSE: 104,
    /** Chart volume series */
    CHART_VOLUME: 105,
    /** Chart open interest series */
    CHART_OPEN_INT: 106,
    /** ID of buyer for each tick */
    CHART_BUYER_ID: 107,
    /** ID of seller for each tick */
    CHART_SELLER_ID: 108,
    /** ID of contributer - MAYBE */
    /*SERIES_CONTRIBUTER_ID : 109,*/

    TYPE_NUMERIC: 1,
    TYPE_STRING: 2,

    // -------------------------------
    // FIDs for quote data:
    // -------------------------------
    /** Last price */
    QUOTE_LAST: 6,
    /** Open interest */
    QUOTE_OPEN_INT: 7,
    /** Volume at last trade */
    QUOTE_VOLUME_INC: 8,
    /** Bid price */
    QUOTE_BID: 10,
    /** Time stamp */
    QUOTE_TIME_STAMP: 17,
    /** Ask price */
    QUOTE_ASK: 11,
    /** Mid price */
    QUOTE_MID_PRICE: 9,
    /** High */
    QUOTE_HIGH: 2,
    /** Low */
    QUOTE_LOW: 3,
    /** Open */
    QUOTE_OPEN: 4,
    /** Close */
    QUOTE_CLOSE: 1,
    /** Volume */
    QUOTE_VOLUME: 5,
    /** Contributer */
    QUOTE_CONTRIBUTOR: 23,
    /** Bid size */
    QUOTE_BID_SIZE: 12,
    /** Ask size */
    QUOTE_ASK_SIZE: 13,
    /** Yesterday's volume */
    QUOTE_PRV_VOLUME: 18,
    /** Settlement price */
    QUOTE_SETTLE_PRICE: 20,
    /** Dividend */
    QUOTE_DIVIDEND: 26,
    /** Instrument name */
    QUOTE_NAME: 25,


    /** Avarage trade price today */
    QUOTE_AVG_PRICE: 16,
    /** Earnings per share */
    QUOTE_EARN_PER_SHARE: 24,
    /** ISIN Code (ISO 6166) */
    QUOTE_ISIN_CODE: 39,
    /** Equity per share */
    QUOTE_EQUITY_PER_SHARE: 40,
    /** Sales per share */
    QUOTE_SALES_PER_SHARE: 41,
    /** Shares out (Total number of shares) */
    QUOTE_TOTAL_SHARES: 42,

    /** 52 week high */
    QUOTE_52W_HIGH: 21,
    /** 52 week low */
    QUOTE_52W_LOW: 22,
    /** This year high */
    QUOTE_YEAR_HIGH: 43,
    /** This year low */
    QUOTE_YEAR_LOW: 44,

    /** 1 week high */
    QUOTE_1W_HIGH: 120,
    /** 1 week low */
    QUOTE_1W_LOW: 121,
    /** 1 month high */
    QUOTE_1MONTH_HIGH: 122,
    /** 1 month low */
    QUOTE_1MONTH_LOW: 123,
    /** 3 month high */
    QUOTE_3MONTH_HIGH: 124,
    /** 3 month low */
    QUOTE_3MONTH_LOW: 125,
    /** 6 month high */
    QUOTE_6MONTH_HIGH: 126,
    /** 6 month low */
    QUOTE_6MONTH_LOW: 127,


    /** Closing price 31. Dec previous year (last price last year) */
    QUOTE_PRV_YEAR_CLOSE: 19,
    /** Closing price 1 week ago */
    QUOTE_1WEEK_CLOSE: 27,
    /** Closing price 1 month ago */
    QUOTE_1MONTH_CLOSE: 28,
    /** Closing price 3 months ago */
    QUOTE_3MONTH_CLOSE: 29,
    /** Closing price 12 months ago */
    QUOTE_1YEAR_CLOSE: 30,
    /** Closing price 6 months ago */
    QUOTE_6MONTH_CLOSE: 117,

    /** Earnings per share, estimated */
    QUOTE_EARN_PER_SHARE_EST: 97,
    /** Beta */
    QUOTE_BETA: 98,
    /** Yield */
    QUOTE_YIELD: 99,
    /** Debt-to-Equity ratio */
    QUOTE_DEBT_TO_EQUITY: 100,

    /** The instrument-type (TYPE_NOT_CLASSIFIED, TYPE_STOCK, TYPE_BOND etc.) */
    QUOTE_INSTRUMENT_TYPE: 107,
    /** The industry-sector code (GIGS). 0 (zero) means not classified (but in order to save bandwidth it is recommended not to contribute it in that case - e.g. field will be N/A which means the same). Level/depth of classification is optional. I.e. at Sectors level there are 10 items, and at the next level (Industry Groups) there are 24 items */
    QUOTE_INDUSTRY_CODE: 108,
    /** The industry-sector name */
    QUOTE_INDUSTRY_NAME: 109,
    /** The ID of last buyer */
    QUOTE_BUYER_ID: 110,
    /** The ID of last seller */
    QUOTE_SELLER_ID: 111,

    /** The minimum number of shares that is necessary to buy in order to make a trade (e.g. minimum volume) */
    QUOTE_BOARD_LOT: 113,
    /** The instrument's exchange/market id (Market Identifier Code - MIC) as defined by ISO 10383. Can be used to lookup other instruments in the same market. */
    QUOTE_MARKET_ID: 115,
    /** The currency in which the quotes/prices of this instrument is given (three-letter ISO 4217 currency code ? i.e. "EUR", "DKK", "USD" etc.) */
    QUOTE_CURRENCY: 116,



    // -------------------------------
    // The below quote FIDs should not be sent to the client
    // (will be calculated by end-user-application from other FIDs)
    // -------------------------------

    /** Today's net change */
    _QUOTE_CHANGE: 14, // (LAST-CLOSE)
    /** Today's percentage change */
    _QUOTE_PERCENT_CHANGE: 15, // ((CHANGE*100)/CLOSE)
    /** This year net change */
    _QUOTE_YEAR_CHANGE: 31, // (LAST-PRV_YEAR_CLOSE)
    /** This year percentage change */
    _QUOTE_YEAR_PERCENT_CHANGE: 32, // ((YEAR_CHANGE*100)/PRV_YEAR_CLOSE)

    /** 1 week net change */
    _QUOTE_1WEEK_CHANGE: 33, // (LAST-1WEEK_CLOSE)
    /** 1 week percentage change */
    _QUOTE_1WEEK_PERCENT_CHANGE: 34, // ((1WEEK_CHANGE*100)/1WEEK_CLOSE)	

    /** 1 month net change */
    _QUOTE_1MONTH_CHANGE: 35, // (LAST-1MONTH_CLOSE)
    /** 1 month percentage change */
    _QUOTE_1MONTH_PERCENT_CHANGE: 36, // ((1MONTH_CHANGE*100)/1MONTH_CLOSE)

    /** 3 month net change */
    _QUOTE_3MONTH_CHANGE: 45, // (LAST-3MONTH_CLOSE)
    /** 3 month percentage change */
    _QUOTE_3MONTH_PERCENT_CHANGE: 46, // ((3MONTH_CHANGE*100)/3MONTH_CLOSE)	

    /** 12 months net change */
    _QUOTE_1YEAR_CHANGE: 37, // (LAST-1YEAR_CLOSE)
    /** 12 months percentage change */
    _QUOTE_1YEAR_PERCENT_CHANGE: 38, // ((1YEAR_CHANGE*100)/1YEAR_CLOSE)

    /** 6 month net change */
    _QUOTE_6MONTH_CHANGE: 118, // (LAST-6MONTH_CLOSE)
    /** 6 month percentage change */
    _QUOTE_6MONTH_PERCENT_CHANGE: 119, // ((6MONTH_CHANGE*100)/6MONTH_CLOSE)

    /** Price per earnings (P/E) */
    _QUOTE_PRICE_PER_EARN: 101, // (LAST/EARN_PER_SHARE)
    /** Price per earnings (P/E), estimated */
    _QUOTE_PRICE_PER_EARN_EST: 102, // (LAST/EARN_PER_SHARE_EST)	
    /** Earnings per price, estimated */
    _QUOTE_EARN_PER_PRICE_EST: 103, // (100*EARN_PER_SHARE_EST/LAST)	
    /** Amount turnover (for last stock trade) */
    _QUOTE_AMOUNT_TURNOVR: 104, // (LAST*VOLUME_INC)
    /** Symbol of instrument */
    _QUOTE_SYMBOL: 105,
    /** Combination of bid & ask, which can be displayed as a single field/string (or only last if available) */
    _QUOTE_LAST_BID_ASK: 106,

    /** Market capitalization (also known as market cap - represents the current cost of buying the whole company on the open market). If LAST if not available, CLOSE is used instead */
    _QUOTE_MARKET_CAP: 112, // LAST*TOTAL_SHARES
    /** The minimum amount of money necessary to make a trade on the minimum allowed volume */
    _QUOTE_BOARD_LOT_VALUE: 114, // LAST*BOARD_LOT

    // -------------------------------
    // The below quote FIDs ONLY exists on forex/money markets.
    // Anyway, each of them still get a unique FID.
    // -------------------------------

    /** Overnight Bid */
    QUOTE_BID_ON: 47,
    /** Overnight Ask */
    QUOTE_ASK_ON: 48,
    /** Spot/Next Bid */
    QUOTE_BID_SN: 49,
    /** Spot/Next Ask */
    QUOTE_ASK_SN: 50,
    /** Tommorow/Next Bid */
    QUOTE_BID_TN: 51,
    /** Tommorow/Next Ask */
    QUOTE_ASK_TN: 52,

    /** 1 Week Bid */
    QUOTE_BID_1W: 53,
    /** 1 Week Ask */
    QUOTE_ASK_1W: 54,
    /** 2 Weeks Bid */
    QUOTE_BID_2W: 55,
    /** 2 Weeks Ask */
    QUOTE_ASK_2W: 56,
    /** 3 Weeks Bid */
    QUOTE_BID_3W: 57,
    /** 3 Weeks Ask */
    QUOTE_ASK_3W: 58,

    /** 1 Month Bid */
    QUOTE_BID_1M: 59,
    /** 1 Month Ask	*/
    QUOTE_ASK_1M: 60,
    /** 2 Months Bid */
    QUOTE_BID_2M: 61,
    /** 2 Months Ask */
    QUOTE_ASK_2M: 62,
    /** 3 Month Bid */
    QUOTE_BID_3M: 63,
    /** 3 Month Ask */
    QUOTE_ASK_3M: 64,
    /** 4 Month Bid */
    QUOTE_BID_4M: 65,
    /** 4 Month Ask */
    QUOTE_ASK_4M: 66,
    /** 5 Months Bid */
    QUOTE_BID_5M: 67,
    /** 5 Months Ask */
    QUOTE_ASK_5M: 68,
    /** 6 Months Bid */
    QUOTE_BID_6M: 69,
    /** 6 Months Ask */
    QUOTE_ASK_6M: 70,
    /** 7 Months Bid */
    QUOTE_BID_7M: 71,
    /** 7 Months Ask */
    QUOTE_ASK_7M: 72,
    /** 8 Months Bid */
    QUOTE_BID_8M: 73,
    /** 8 Months Ask */
    QUOTE_ASK_8M: 74,
    /** 9 Months Bid */
    QUOTE_BID_9M: 75,
    /** 9 Months Ask */
    QUOTE_ASK_9M: 76,
    /** 10 Months Bid */
    QUOTE_BID_10M: 77,
    /** 10 Months Ask */
    QUOTE_ASK_10M: 78,
    /** 11 Months Bid */
    QUOTE_BID_11M: 79,
    /** 11 Months Ask */
    QUOTE_ASK_11M: 80,

    /** 1 Year Bid */
    QUOTE_BID_1Y: 81,
    /** 1 Year Ask */
    QUOTE_ASK_1Y: 82,
    /** 2 Years Bid */
    QUOTE_BID_2Y: 83,
    /** 2 Years Ask */
    QUOTE_ASK_2Y: 84,
    /** 3 Years Bid */
    QUOTE_BID_3Y: 85,
    /** 3 Years Ask */
    QUOTE_ASK_3Y: 86,
    /** 4 Years Bid */
    QUOTE_BID_4Y: 87,
    /** 4 Years Ask */
    QUOTE_ASK_4Y: 88,
    /** 5 Years Bid */
    QUOTE_BID_5Y: 89,
    /** 5 Years Ask	*/
    QUOTE_ASK_5Y: 90,
    /** 6 Years Bid */
    QUOTE_BID_6Y: 91,
    /** 6 Years Ask */
    QUOTE_ASK_6Y: 92,
    /** 7 Years Bid */
    QUOTE_BID_7Y: 93,
    /** 7 Years Ask */
    QUOTE_ASK_7Y: 94,
    /** 10 Years Bid */
    QUOTE_BID_10Y: 95,
    /** 10 Years Ask */
    QUOTE_ASK_10Y: 96
}



