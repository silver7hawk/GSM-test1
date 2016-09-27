//-----------------config section-------------------//

//var provider = "netdania_fxa";
var provider = "netdania_fxa2";
var instruments = ['XAUXAG'];
var instrumentsNames = ['Gold / Silver Ratio'];


//-----------------end config section-------------------//

/*
http://www.JSON.org/json2.js
2009-09-29

Public Domain.

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

See http://www.JSON.org/js.html
*/
if (!this.JSON) { this.JSON = {}; } (function() { function l(c) { return c < 10 ? '0' + c : c } if (typeof Date.prototype.toJSON !== 'function') { Date.prototype.toJSON = function(c) { return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + l(this.getUTCMonth() + 1) + '-' + l(this.getUTCDate()) + 'T' + l(this.getUTCHours()) + ':' + l(this.getUTCMinutes()) + ':' + l(this.getUTCSeconds()) + 'Z' : null }; String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(c) { return this.valueOf() } } var o = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, p = /[\\\"\x00-\xreqf\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, h, m, r = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' }, j; function q(a) { p.lastIndex = 0; return p.test(a) ? '"' + a.replace(p, function(c) { var f = r[c]; return typeof f === 'string' ? f : '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + a + '"' } function n(c, f) { var a, e, d, i, k = h, g, b = f[c]; if (b && typeof b === 'object' && typeof b.toJSON === 'function') { b = b.toJSON(c) } if (typeof j === 'function') { b = j.call(f, c, b) } switch (typeof b) { case 'string': return q(b); case 'number': return isFinite(b) ? String(b) : 'null'; case 'boolean': case 'null': return String(b); case 'object': if (!b) { return 'null' } h += m; g = []; if (Object.prototype.toString.apply(b) === '[object Array]') { i = b.length; for (a = 0; a < i; a += 1) { g[a] = n(a, b) || 'null' } d = g.length === 0 ? '[]' : h ? '[\n' + h + g.join(',\n' + h) + '\n' + k + ']' : '[' + g.join(',') + ']'; h = k; return d } if (j && typeof j === 'object') { i = j.length; for (a = 0; a < i; a += 1) { e = j[a]; if (typeof e === 'string') { d = n(e, b); if (d) { g.push(q(e) + (h ? ': ' : ':') + d) } } } } else { for (e in b) { if (Object.hasOwnProperty.call(b, e)) { d = n(e, b); if (d) { g.push(q(e) + (h ? ': ' : ':') + d) } } } } d = g.length === 0 ? '{}' : h ? '{\n' + h + g.join(',\n' + h) + '\n' + k + '}' : '{' + g.join(',') + '}'; h = k; return d } } if (typeof JSON.stringify !== 'function') { JSON.stringify = function(c, f, a) { var e; h = ''; m = ''; if (typeof a === 'number') { for (e = 0; e < a; e += 1) { m += ' ' } } else if (typeof a === 'string') { m = a } j = f; if (f && typeof f !== 'function' && (typeof f !== 'object' || typeof f.length !== 'number')) { throw new Error('JSON.stringify'); } return n('', { '': c }) } } if (typeof JSON.parse !== 'function') { JSON.parse = function(i, k) { var g; function b(c, f) { var a, e, d = c[f]; if (d && typeof d === 'object') { for (a in d) { if (Object.hasOwnProperty.call(d, a)) { e = b(d, a); if (e !== undefined) { d[a] = e } else { delete d[a] } } } } return k.call(c, f, d) } o.lastIndex = 0; if (o.test(i)) { i = i.replace(o, function(c) { return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4) }) } if (/^[\],:{}\s]*$/.test(i.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) { g = eval('(' + i + ')'); return typeof k === 'function' ? b({ '': g }, '') : g } throw new SyntaxError('JSON.parse'); } } } ());


// jXHR.js (JSON-P XHR)
// v0.1 (c) Kyle Simpson
// MIT License

(function(global) {
    var SETTIMEOUT = global.setTimeout, // for better compression
		doc = global.document,
		callback_counter = 0;

    global.jXHR = function() {
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
            try { publicAPI.onerror.call(publicAPI, msg, script_url); } catch (err) { throw new Error(msg); }
        }

        function handleScriptLoad() {
            if ((this.readyState && this.readyState !== "complete" && this.readyState !== "loaded") || script_loaded) { return; }
            this.onload = this.onreadystatechange = null; // prevent memory leak
            script_loaded = true;
            if (publicAPI.readyState !== 4) {ThrowError("Script loading failed [" + script_url + "].");}
            removeScript();
        }

        function fireReadyStateChange(rs, args) {
            args = args || [];
            publicAPI.readyState = rs;
            if (typeof publicAPI.onreadystatechange === "function") {publicAPI.onreadystatechange.apply(publicAPI, args);}
        }

        publicAPI = {
            onerror: null,
            onreadystatechange: null,
            readyState: 0,
            open: function(method, url) {
                reset();
                internal_callback = "cb" + (callback_counter++);
                (function(icb) {
                    global.jXHR[icb] = function() {
                        try { fireReadyStateChange.call(publicAPI, 4, arguments); }
                        catch (err) {
                            publicAPI.readyState = -1;
                            ThrowError("Script failed to run [" + script_url + "].");
                            alert(err);//console.log(err);
                        }
                        global.jXHR[icb] = null;
                    };
                })(internal_callback);
                script_url = url.replace(/=\?/, "=jXHR." + internal_callback);
                fireReadyStateChange(1);
            },
            send: function() {
                SETTIMEOUT(function() {
                    scriptElem = doc.createElement("script");
                    scriptElem.setAttribute("type", "text/javascript");
                    scriptElem.onload = scriptElem.onreadystatechange = function() { handleScriptLoad.call(scriptElem); };
                    scriptElem.setAttribute("src", script_url);
                    doc.getElementsByTagName("head")[0].appendChild(scriptElem);
                }, 0);
                fireReadyStateChange(2);
            },
            setRequestHeader: function() { }, // noop
            getResponseHeader: function() { return ""; }, // basically noop
            getAllResponseHeaders: function() { return []; } // ditto
        };

        reset();

        return publicAPI;
    };
})(window);

var ua = navigator.userAgent.toLowerCase();
if (ua.indexOf(" chrome/") >= 0 || ua.indexOf(" firefox/") >= 0 || ua.indexOf(' gecko/') >= 0) {
    var StringMaker = function() {
        this.str = "";
        this.length = 0;
        this.append = function(s) {
            this.str += s;
            this.length += s.length;
        };
        this.prepend = function(s) {
            this.str = s + this.str;
            this.length += s.length;
        };
        this.toString = function() {
            return this.str;
        };
    };
} else {
    var StringMaker = function() {
        this.parts = [];
        this.length = 0;
        this.append = function(s) {
            this.parts.push(s);
            this.length += s.length;
        };
        this.prepend = function(s) {
            this.parts.unshift(s);
            this.length += s.length;
        };
        this.toString = function() {
            return this.parts.join('');
        };
    };
}

var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.";
//var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function encode64(input) {
    var output = new StringMaker();
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

        output.append(keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4));
    }

    return output.toString();
}

function decode64(input) {
    var output = new StringMaker();
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    input = input.replace(/[^A-Za-z0-9\-\_\.]/g, "");
    //input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

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

function getReqObjPrice(strSymbol, strProvider, boolMonitor) {
	var newReqId = ++globalCurrentReqId;
	var tempReqObj = {
		t: 1, // unsigned byte for message type (REQUEST_MONITOR_PRICE = 1)
		i: newReqId, // int indicating the request id
		m: boolMonitor?1:0, // byte indicating subscription mode (SUBSCRIPTION_MODE_SNAPSHOT=0, SUBSCRIPTION_MODE_MONITOR=1)
		s: strSymbol,
		p: strProvider
	};
	return tempReqObj;
}

function getReqObjInstrumentLookup(strMarketId, byteSearchField, strSearch, byteMode, arrInstrTypes, intMax, strProvider) {
	var newReqId = ++globalCurrentReqId;
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

function getReqObjStory(strStoryId, strProvider) {
	var newReqId = ++globalCurrentReqId;
	var tempReqObj = {
		t: 4, // unsigned byte for message type (REQUEST_NEWS_STORY = 4)
		i: newReqId, // int indicating the request id
		s: strStoryId,
		p: strProvider
	};
	return tempReqObj;
}

function getXReqPageSize(){
	var ua = navigator.userAgent.toLowerCase();
	if (ua.indexOf(" chrome/") >= 0 || ua.indexOf(" firefox/") >= 0 || ua.indexOf(' gecko/') >= 0) {
		return 20;
	}
	var i = ua.indexOf("msie");
	if ( i>= 0){
		try{
			if(parseFloat(ua.substring(i+4)) > 7){
				return 20;
			}
		}catch(e){}
	}
	return 4;
}

Netdania = {};
arrRequests = [];
arrRequest_wait = 'notwaiting';
globalCurrentReqId = 0;
globalCurrentCmp = 0;
cbfunctions = [];
sessionId = undefined;
appendingInterval = 100;


function appendRequests(v,remove){
	
	if(window.xreq === undefined  || sessionId === '?'){// || xreq.appending === true
		if(v!==undefined){
			arrRequests = arrRequests.concat(v);
		}
		clearTimeout(arrRequest_wait);
		arrRequest_wait = setTimeout("appendRequests();",50);
		return;
	}	
	
	if(xreq.polling_f === 'paused'){
		clearInterval(xreq.polling_s);
		xreq.polling_s = "paused";
		xreq.polling_f = setInterval("doPolling(" + byteDeliveryType + ")", pollinngInterval_f);
	} 
	
	if(arrRequests.length>0){
		if(v === undefined || v.length == 0){
			v = [];
		}
		v = v.concat(arrRequests);
		arrRequests = [];
	}
	if(v === undefined || v.length === 0){
		return;
	}
	
	var wipv = v;
	var sss = function(){//console.log(wipv.length);
		clearTimeout(xreq.polling_switch);
		var treq = new jXHR();
		
		var tmpv = wipv.slice(0, xreqPageSize);
		wipv = wipv.slice(xreqPageSize, wipv.length);
		
		var a = encode64(JSON.stringify(tmpv));
		
		var url = globalConnectHost + "?" +
				"dt=" + byteDeliveryType + "&" +
				"sessid=" + sessionId + "&" +
				"xcmd=" + a + "&" +
				"cb=?";	
		treq.open("GET", url);
		treq.send();
		if(wipv.length <=xreqPageSize){
			clearTimeout(xreq.polling_switch);
			xreq.polling_switch = setTimeout("pollingSwitch()",pollinng_switch);
		}
		if(wipv.length>0){
			setTimeout(function(){sss(wipv)}, appendingInterval);
		}
	}
	sss(wipv);
	
}

function pollingSwitch(){
	if(xreq.polling_s == 'paused'){
		clearInterval(xreq.polling_f);
		xreq.polling_f = 'paused';
		xreq.polling_s = setInterval("doPolling(" + byteDeliveryType + ")", pollinngInterval_s);
	} 
}

function handleError(msg, url) {
    //alert(msg);
}

function startConnection(){ //window 
	var g = window;
	g.xreqPageSize = getXReqPageSize();
	g.sessionId ='?';
	g.pollinngInterval_s = 1000;
	g.pollinngInterval_f = 100;
	g.pollinng_switch = 5000;
	g.globalConnectHost = "https://balancer.netdania.com/StreamingServer/StreamingServer";
	g.byteConnBehavior = 3; // CONNECTION_STREAMING = 1, CONNECTION_POLLING = 2, CONNECTION_LONG_POLLING = 3
	g.byteDeliveryType = 1; // Delivery-type (JSON/0, JSONP/1, SCRIPT-TAG/2).
	g.appendingInterval = 200;
	g.handshake = {
		g: "goldenstatemint",
		ai: "goldenstatemint.com",
		pr: byteConnBehavior // CONNECTION_STREAMING = 1, CONNECTION_POLLING = 2, CONNECTION_LONG_POLLING = 3
	};

	var strHandshake = encode64(JSON.stringify(handshake));

    var url = globalConnectHost + "?" +
                    "xstream=1&" +
                    "v=1&" +
                    "dt=1&" +
                    "h=" + strHandshake + "&" +
                   // "xcmd=" + strArrRequests + "&" +
                    "cb=?" +
                    "&ts=" + Math.random();
	g.xreq = new jXHR();
	xreq.pending = false;
	xreq.appending = false;
	xreq.totalCount = -1;
    xreq.onerror = handleError;
    xreq.onreadystatechange = function(data) {
        if (xreq.readyState === 4){
			sessionId = data[1].m;
			//appendRequests(arrRequests);
			//arrRequests = [];
			xreq.url = globalConnectHost + "?" +
					"dt=" + byteDeliveryType + "&" +
					"sessid=" + sessionId + "&" +
					"cb=?&" +
					"xpoll&" +
					"&ts=" + Math.random();
			
            xreq.onreadystatechange = function(data) {
				if (xreq.readyState === 4) {
					if (data !== '' && data !== undefined) {
						for(var kk = 0; kk < cbfunctions.length; kk++){
							
							if(cbfunctions[kk].hasOwnProperty('win'))
							{
							    if(cbfunctions[kk].hasOwnProperty('win')!== null)
							    {
							        cbfunctions[kk].update(data, cbfunctions[kk].cmp, cbfunctions[kk].win);
							    }
							}
							else
							{
							    cbfunctions[kk].update(data, cbfunctions[kk].cmp);
							}
							
						}
					}
					xreq.pending = false;
				}
			};
			xreq.polling_s = 'paused';
            xreq.polling_f = setInterval("doPolling(" + byteDeliveryType + ")", pollinngInterval_f);
        }
    };
	xreq.open("GET", url);
    xreq.send();
}

function removeArrayItem(arr, v){
	for(var i = 0; i<arr.length; i++){
		if(arr[i] === v){
			arr.splice(i,1);
			break;
		}
	}
}

function doPolling(byteDeliveryType) {
	if (sessionId === null) {
		//alert("TODO: We cannot poll as we do not have a session-id from the server!");
		return;
	}
	
	if(xreq.pending === false /*&& xreq.appending === false*/){
		xreq.pending = true;
		xreq.open("GET", xreq.url);
		xreq.send();
	}
}

defaultRenderers = {
	f14: function(grid, rec, cellid, val, oldval, fxy) {
		var upImagePath = "https://www.goldenstatemint.com/images/up.gif";
		var downImagePath = "https://www.goldenstatemint.com/images/down.gif";
		val = parseFloat(val).toFixed(2);
		if(val === "NaN"){
			return '<span></span>';
		}
		//return '<span>' + val +'</span>';
		
		
		/*Up Down Images*/

		var value = '<span>' + val +'&nbsp; &nbsp;</span>';
		if (val > 0) {
			value = '<span>' + val + ' <img src="' + upImagePath + '"></span>';
	} else if (val < 0) {
			value = '<span>' + val + ' <img src="' + downImagePath + '"></span>';
		}
		return value;
		//val;
	},
	f15: function(grid, rec, cellid, val, oldval, fxy) {
	
		var upImagePath = "https://www.goldenstatemint.com/images/up.gif";
		var downImagePath = "https://www.goldenstatemint.com/images/down.gif";
		val = parseFloat(val).toFixed(2);
		val = val.replace("NaN", "");
		if(val === ""){
			return '<span></span>';
		}
		val = val.replace("-0.00", "0.00");
		
/*Up Down Images*/

		var value = '<span>' + val +'&nbsp; &nbsp; &nbsp;</span>';
		if (val > 0) {
			value = '<span>' + val + '  <img src="' + upImagePath + '"></span>';
	} else if (val < 0) {
			value = '<span>' + val + '  <img src="' + downImagePath + '"></span>';
		}
		return value;
		//val;
	},
	f17: function(grid, rec, cellid, val, oldval, fxy) {
			if (val === '' || val === "N/A" || val === undefined) {
				return "";
			}
			var dateUnf = new Date(val * 1000);
			return '<span>' + dateFormat(dateUnf, "m/d/yy h:MM TT")+'</span>';
		}
};

/**
 * Gets the current time in milliseconds from 1970.
 */
function getCurrentDateTime() {
	var date = new Date();
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
}

function getDate(val){
		dtArray = val.split(" ");
        dt = dtArray[0];
        time = dtArray[1];

        timeArray = time.split(":");
        hour = timeArray[0];
        min = timeArray[1];
        sec = timeArray[2];

        diff = calculate_time_zone();

        tzArray = diff.split(":");

        hoursDiff = parseInt(tzArray[0], 10);
        minDiff = parseInt(tzArray[1], 10);

        dtArray = dt.split("-");

        today = new Date();
        today.setFullYear(dtArray[0], dtArray[1] - 1, dtArray[2]);
        today.setHours(hour, min, sec);
        newDate = today.add(Date.HOUR, hoursDiff);
        
		return newDate;
}

var dateFormat = function() {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[\-+]\d{4})?)\b/g,
		timezoneClip = /[^\-+\dA-Z]/g,
		pad = function(val, len) {
		    val = String(val);
		    len = len || 2;
		    while (val.length < len) {val = "0" + val;}
		    return val;
		};

    // Regexes and supporting functions are cached through closure
    return function(date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && (typeof date == "string" || date instanceof String) && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date();
        if (isNaN(date)){ throw new SyntaxError("invalid date");}

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
			    d: d,
			    dd: pad(d),
			    ddd: dF.i18n.dayNames[D],
			    dddd: dF.i18n.dayNames[D + 7],
			    m: m + 1,
			    mm: pad(m + 1),
			    mmm: dF.i18n.monthNames[m],
			    mmmm: dF.i18n.monthNames[m + 12],
			    yy: String(y).slice(2),
			    yyyy: y,
			    h: H % 12 || 12,
			    hh: pad(H % 12 || 12),
			    H: H,
			    HH: pad(H),
			    M: M,
			    MM: pad(M),
			    s: s,
			    ss: pad(s),
			    l: pad(L, 3),
			    L: pad(L > 99 ? Math.round(L / 10) : L),
			    t: H < 12 ? "a" : "p",
			    tt: H < 12 ? "am" : "pm",
			    T: H < 12 ? "A" : "P",
			    TT: H < 12 ? "AM" : "PM",
			    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
			    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

        return mask.replace(token, function($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
} ();

// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
    monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function(mask, utc) {
    return dateFormat(this, mask, utc);
};


function stripHeadline(headline, length) {

        if (headline.length < length) {
            return headline;
        }
        else {
            return headline.substring(0, length) + '...';
        }
    }


function getRecordById(records, id){
	for (var k = 0; k < records.length; k++) {
		if(records[k].id === id){
			return records[k];
		}
	}
	return undefined;
}


function refreshCell(grid, rec, cellid, val, oldval, fxy){
	var torender = '<span>'+ val +'</span>';
	if(grid.renderers[fxy]!== undefined){
		torender = grid.renderers[fxy].fn(grid, rec, cellid, val, oldval, fxy);
	}
	var cell = document.getElementById(cellid);
	
	if(cell !== null){
		cell.innerHTML = torender;
	}
	if(grid.renderers[fxy]!== undefined && grid.renderers[fxy].hightlightInterval !== undefined){
		setTimeout('reset_highlight("' + cellid + '")', grid.renderers[fxy].hightlightInterval);
	}
}

function receiveQuotesJsonData_light(data,grid){
	var recs = grid.records;
	var validCmp = false;
	for (var k = 0; k < data.length; k++) {
		if (data[k].f) {
			var r = getRecordById(grid.records, "recid-"+data[k].i);
			if(r === undefined){
				continue;
			}
			validCmp = true;
			var last = "notdirty";
			var bid = "notdirty";
			var ask = "notdirty";
			var close = "notdirty";
			var yclose = "notdirty";
			var name = "notdirty";var name2 = "notdirty";
			var realSymbol = "notdirty";
			var tempOldValue = '';
			var tempOldName = r.data.f25;
			
			for(var i = 0; data[k] && i< data[k].f.length; i++){
				var field = data[k].f[i];
				if(field.f === 6){
					r.last = parseFloat(field.v).toFixed(4);
					last = "dirty";
				}
				if(field.f === 10){r.bid = field.v; bid = 'dirty';}
				if(field.f === 11){r.ask = field.v; ask = 'dirty';}
				if(field.f === 1){r.close = field.v; close = 'dirty';}
				if(field.f === 19){r.yclose = field.v; yclose = 'dirty';}
				if (field.f === 1003) {
					if(r.realSymbol !== undefined){
						realSymbol = "dirty";
					}
					r.realSymbol = field.v;
				}
				if (field.f === 39) { r.isin = field.v;}
				
				if("f"+field.f in grid.columns){
					tempOldValue = r.data["f"+field.f];
					r.data["f"+field.f] = field.v;
					if(field.f === 6){
						r.data.f6 = r.last;
					}
					if(field.f === 25){
						if(tempOldValue === undefined){
							r.data.f25 = field.v;
							name = "dirty";
						}
					}else if(field.f === 5013){
						r.data.f5013 = field.v;
						name2 = "dirty";
					}else{
						refreshCell(grid,r, r.id+'-f'+field.f, field.v,tempOldValue, 'f'+field.f);
					}
				}
				
			}
			if(r.realSymbol!== undefined){
				last = "dirty";
			}
			if(name === "dirty" || realSymbol === "dirty"){
				refreshCell(grid,r, r.id+'-f25', r.data.f25,tempOldName, 'f25');
			}
			if(name2 === "dirty"){
				refreshCell(grid,r, r.id+'-f5013', r.data.f5013,'', 'f5013');
			}
			if(grid.contentType === 'indexes' && last === "notdirty" && (bid ==="dirty" || ask==="dirty")){
				r.last = getLast("N/A", r.bid, r.ask,4);
				last = "dirty";
				if('f6' in grid.columns){
					tempOldValue = r.data.f6;
					r.data.f6 = r.last;
					refreshCell(grid,r,r.id+'-f6', r.last, tempOldValue, 'f6');
				}
			}
			
			if(last!== "notdirty" || close !== "notdirty"){
				if('f15' in grid.columns){
					tempOldValue = r.data.f15;
					r.data.f15 = computePctChange(r.last, r.close);
					refreshCell(grid,r,r.id+'-f15', r.data.f15, tempOldValue,'f15');
				}
				if('f14' in grid.columns){
					tempOldValue = r.data.f14;
					r.data.f14 = computeChange(r.last, r.close);
					refreshCell(grid,r,r.id+'-f14', r.data.f14, tempOldValue,'f14');
				}
				
			}
			
			if(last!== "notdirty" || yclose !== "notdirty"){
				if('f32' in grid.columns){
					tempOldValue = r.data.f32;
					r.data.f32 = computePctYChange(r.last, r.yclose);
					refreshCell(grid,r,r.id+'-f32', r.data.f32, tempOldValue,'f32');
				}
				if('f31' in grid.columns){
					tempOldValue = r.data.f31;
					r.data.f31 = computeYChange(r.last, r.yclose);
					refreshCell(grid,r,r.id+'-f31', r.data.f31, tempOldValue,'f31');
				}
				
			}
		}
	}
	
}

function isInArray(val, arr) {
    var isInArr = false;
    for (i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            isInArr = true;
            break;
        }
    }
    return isInArr;
}

function replaceHtml(el, html) {
	if(el === undefined || el === null){return;}
	var oldEl = typeof el === "string" ? document.getElementById(el) : el;
	/*@cc_on // Pure innerHTML is slightly faster in IE
		oldEl.innerHTML = html;
		return oldEl;
	@*/
	
	var newEl = oldEl.cloneNode(false);
	newEl.innerHTML = html;
	oldEl.parentNode.replaceChild(newEl, oldEl);
	/* Since we just removed the old element from the DOM, return a reference
	to the new element, which can be used to restore variable references. */
	return newEl;
};


function cbf_lookup(data, cmp) {
	if (cmp.type !== 'quoteslookup' || cmp.loaded === 'loaded') { return; }
	var instr = [];
	if(cmp.names === undefined){
		cmp.names = {};
	}
	for (var i = 0, len = data.length; i < len; i++) {
		if (isInArray(data[i].i, cmp.requests)) {
			if (data[i].a) {
				for (var lj = 0, lenlj = data[i].a.length; lj < lenlj; lj++) {
					if(cmp.noPriceUpdate === true){
						cmp.search = true;
						cmp.records.push({
							symbol : data[i].a[lj].s,
							data:{symbol: data[i].a[lj].s, name: data[i].a[lj].n, type: data[i].a[lj].t}
						});
					}else{
						cmp.names[data[i].a[lj].s] = data[i].a[lj].n;
					}
				}
			}
			removeArrayItem(cmp.requests, data[i].i);
		}
	}
	if(cmp.requests.length === 0 && cmp.search === true){
		cmp.search = false;
		cmp.requestItems = [];
		cmp.loaded = 'loaded';
		renderTable(cmp.tableConfig, cmp.tableConfig.startFrame, cmp.tableConfig.endFrame);
		return;
	}
	
	if (cmp.requests.length === 0) {
		cmp.loaded = 'loaded';
		//removeCallback(cmp);
		cbfunctions.push({ cmp: cmp, update: cbf_update });
		cmp.requestItems = [];
		cmp.reqKeys_del = [];
		var new_keys_del = [];
		var recs = [];
		for(var ri = 0; ri< cmp.records.length; ri++){
			var rec = cmp.records[ri];
			if(cmp.names[rec.symbol] === undefined){
				//rec.markRemove = true;
				cmp.reqKeys_del.push(rec.i);
			}else{
				cmp.names[rec.symbol] = rec;
				//recs.push(rec);
				new_keys_del.push(rec.i);
			}
		}
		for(s in cmp.names){
			if(typeof(cmp.names[s]) === 'object'){
				recs.push(cmp.names[s]);
			}else{
				var req = getReqObjPrice(s, cmp.provider, true);
				cmp.requestItems.push(req);
				recs.push({
					id: "recid-" + req.i,
					data: {f25: cmp.names[s]},
					symbol: s,
					i: req.i
				});
				new_keys_del.push(req.i);
			}
			
		}
		cmp.names = {};
		cmp.records = recs;
		
		appendRequests(cmp.requestItems);
		cmp.requestItems = [];
		
		if(cmp.sortBy === undefined){
			cmp.sortBy = false;
		}
		if(cmp.sortBy !== false ){
			cmp.records = sortCmpGrid(cmp.records, cmp.sortBy);
		}
		renderTable(cmp.tableConfig, cmp.tableConfig.startFrame, cmp.tableConfig.endFrame);
		removeRequests(cmp.reqKeys_del);
		cmp.reqKeys_del = new_keys_del;
	}
}

function sortCmpGrid(v, field){
	var sf = function(r1, r2){
		if (r1.data.f25 < r2.data.f25) {return -1}
		if (r1.data.f25 > r2.data.f25) {return 1}
		return 0;
	}
	return v.sort(sf);
}

function cbf_update(xdata, cmp) {
	receiveQuotesJsonData_light(xdata, cmp);
}


function getReqObjHeadlines(strSource, intMax, strProvider, boolMonitor) {
	var newReqId = ++globalCurrentReqId;
	var tempReqObj = {
		t: 3, // unsigned byte for message type (REQUEST_MONITOR_HEADLINES = 3)
		i: newReqId, // int indicating the request id
		m: boolMonitor?1:0, // byte indicating subscription mode (SUBSCRIPTION_MODE_SNAPSHOT=0, SUBSCRIPTION_MODE_MONITOR=1)
		s: strSource,
		p: strProvider,
		max: intMax
	};
	return tempReqObj;
}

function getReqObjRemove(intReqId) {
	var tempReqObj = {
		t: 5, // unsigned byte for message type (REQUEST_REMOVE = 5)
		i: intReqId // int indicating the request id (of request to remove)
	};
	return tempReqObj;
}

function removeRequests(v){if(v=== undefined){return;}
	var rv = [];
	for(var i = 0; i<v.length; i++){
		rv.push(getReqObjRemove(v[i]));
	}
	appendRequests(rv,true);
}


function removeCallback(p){
	var toRemove = -1;
	for(var i = 0; i<cbfunctions.length; i++){
		if(cbfunctions[i].cmp === p || (cbfunctions[i].cmp !== undefined && cbfunctions[i].cmp.id === p.id)){
			toRemove = i;
		}
	}
	if(toRemove !== -1){
		cbfunctions.splice(toRemove,1);
	}
}


function cbf_update_news(data, grid){
	var hasNews = false;
	for (var i = 0, len = data.length; i < len; i++) {
		if (isInArray(data[i].i, grid.reqKeys)) {
			if (data[i].h) {
				for (var lj = data[i].h.length-1; lj >=0; lj--) {
					hasNews = true;
					var h = data[i].h[lj];
					
					var r = {
						id: "recid" + lj,
						data: {
							t: h.t,
							s: h.s,
							i: h.i,
							h: h.h,
							provider: h.provider
						}
					}
					grid.records.push(r);
					
				}
				if(hasNews === false){
					hasNews = true;
					var h = data[i].h;
					
					var r = {
						id: "recid" + lj,
						data: {
							t: h.t,
							s: h.s,
							i: h.i,
							h: h.h
						}
					}
					grid.records.splice(0, 0, r);
					grid.records.splice(grid.records.length-1, 1);
				}
			}
		}
	}
	if(hasNews === true || grid.newsPainted !== true){
		renderTable(grid.tableConfig);
		grid.newsPainted = true;
	}

	
}


function getBidAsk(bid, ask, decimals) {
	return bid;
    if (bid === "N/A" || ask === "N/A") {
        return bid;
    }

    if (decimals !== null && decimals !== undefined) {
	    try {
	        bid = parseFloat(bid).toFixed(decimals);
	    }
	    catch (ex) {
	    }
	    try {
	        ask = parseFloat(ask).toFixed(decimals);
	    }
	    catch (ex_) {
	    }
    }

    var charsChanged = false;
    subBid = bid.substring(0, 1);
    subAsk = ask.substring(0, 1);
    finishAsk = "/";
    var i = 0;
    while (i < bid.length && i < ask.length) {
        subBid = bid.substring(i, i + 1);
        subAsk = ask.substring(i, i + 1);
        if (charsChanged || (subBid !== subAsk)) {
            charsChanged = true;
            finishAsk = finishAsk + subAsk;
        }
        i++;
    }
    if (finishAsk !== "/") {
        return bid/* + finishAsk*/;
    } else {
        return bid;
    }
}

function getLast(value, bid, ask, decimals) {
	
	if (decimals !== null && decimals !== undefined ) {
	    if (value !== "N/A") {
	        try {
	            value = parseFloat(value).toFixed(decimals);
	        }
	        catch (ex) {
	        }
	    }
	}

    var val = value;
    if (val === "N/A") {
        val = getBidAsk(bid, ask, decimals);
    }
    return val;
}

function computeChange(last, close){
	return parseFloat(last-close).toFixed(2);
}

function computePctChange(last, close){
	if(close!=="" && close !==0){
		return parseFloat((last-close)*100/close).toFixed(2);
	}
	return 'NaN';
}

function computeYChange(last, yclose){
	return parseFloat(last-yclose).toFixed(2);
}

function computePctYChange(last, yclose){
	if(yclose!=="" && yclose !==0){
		return parseFloat((last-yclose)*100/yclose).toFixed(2);
	}
	return 'NaN';
}

function reset_color(spanid){
	var span = document.getElementById(spanid);
	if(span){
		span.firstChild.style.color = '';
	}
}

function reset_highlight(spanid){
	var span = document.getElementById(spanid);
	if (span !== null) {
	    span.firstChild.style.backgroundColor = 'transparent';
	    setTimeout('reset_color("' + spanid + '")', 500);
	}else
	{
	    
	}
}


//render the quotes table
function renderTable(tableConfig, startFrame, endFrame) {
    var headerClass, contentClass, contentOddClass, width, fields, instr;

    fields = tableConfig.fields;
    var cmp = tableConfig.instr;
	instr = cmp.records;
	var tableWidth = 0;
	var headerHtml = '';
	var colsHtml = '';
	var lastField = '';
	contentClass = tableConfig.contentClass;
    if (tableConfig.contentClass === undefined || tableConfig.contentClass === null || tableConfig.contentClass === '') {
        contentClass = "gridDefaultContentClass";
    }
	contentOddClass = tableConfig.contentOddClass;
    if (tableConfig.contentOddClass === undefined || tableConfig.contentOddClass === null || tableConfig.contentOddClass === '') {
        contentOddClass = "gridDefaultContentOddClass";
    }

    if (tableConfig.width !== undefined && tableConfig.width !== null) {
        tableWidth = width;
    }
    for (var prop in fields) {
		lastField = prop;
	}
	var cols = 0;
    for (var prop in fields) {
        if (fields.hasOwnProperty(prop)) {
			cols++;
			colsHtml += '<col width='+fields[prop].width+'>';
			tableWidth += parseInt(fields[prop].width);
			var lc = '';
			if(lastField === prop){
				lc = ' lastColCls';
			}
			headerHtml += '<th class="' + fields[prop].hdTDcls +lc+ '"><span class="' + fields[prop].hdCellCls +'"><span>' + fields[prop].name + '</span></span></th>';
		}
    }
	var forceHeight='';
	if(tableConfig.height!== undefined){
		forceHeight ='style="overflow: auto;overflow-x: hidden; height: '+tableConfig.height+'px;"';
	}
    var align = '';
    if(tableConfig.align === '')
    {
        align = "center";
    }
    else
    {
        align = tableConfig.align;
    }
    var jshtml='';
    if(startFrame !== undefined)
    {
        jshtml = startFrame + '<table width='+ tableWidth +' style="table-layout:fixed;" border="0" cellspacing="0" cellpadding="0" align="'+ align +'">';
    }
    else
    {
        jshtml = '<table width='+ tableWidth +' style="table-layout:fixed;" border="0" cellspacing="0" cellpadding="0">';
    }
	jshtml += colsHtml;
	var t = jshtml;
    if(tableConfig.hideHeaders!==true){
	jshtml += '<thead><tr>';
	jshtml += headerHtml;
    jshtml += '</tr></thead>';
	}
	jshtml+='</table>';
	
	jshtml+='<div '+forceHeight+'>';
	jshtml+=t;
    jshtml += '<tbody >';
	var gday = -1;
	var gmonth = -1;
	var gyear = -1;
	if(tableConfig.groupByDate === true && instr.length > 0){
		gd = new Date(instr[0].data.t *1000);
	}
	
	var noDataMessage = tableConfig.noDataMessage;
	if(noDataMessage === undefined)
	{
	    noDataMessage = 'No updates available!';
	}
	
	if(instr.length == 0){
		jshtml+= '<tr><td colspan='+cols+' class="netd-grid-empty">'+ noDataMessage +'</td></tr>';
	}
    for (var ii = 0; ii < instr.length; ii++) {
        if(tableConfig.groupByDate===true){
			var cd = new Date(instr[ii].data.t * 1000);
			if(cd.getDay()!==gday || cd.getMonth()!==gmonth || cd.getYear()!==gyear){
				jshtml += '<tr><td colspan='+cols+' class="netd-group-hd ">'+dateFormat(cd, "dd. mmmm yyyy")+'</td></tr>';
				gday = cd.getDay();
				gmonth = cd.getMonth();
				gyear = cd.getYear();
			}
		}
		if (ii % 2 === 0) {
            jshtml += '<tr class="' + contentClass + '">';
        }
        else {
            jshtml += '<tr class="' + contentOddClass + '">';
        }
        
        var recid = instr[ii].id;

        for (var prop1 in fields) {
			if (fields.hasOwnProperty(prop1)) {
				var cellid = recid + '-' + prop1;
				var value = instr[ii].data[prop1];
				if(value === undefined){
					value = '';
				}
				if(cmp.renderers[prop1]!== undefined){
					value = cmp.renderers[prop1].fn(cmp, instr[ii], cellid, value, value, prop1);
				}else{
					value = '<span>'+value+'</span>';
				}
				var lc = '';
				if(lastField === prop1){
					lc = ' lastColCls';
				}
				jshtml += '<td  style="overflow: hidden;" class="' + fields[prop1].TDCls +lc+'"><span id="' + cellid + '" class="' + fields[prop1].cellCls + '" >' + value + '</span></td>';
			}
        }
        jshtml += '</tr>';
    }
	jshtml += '</tbody>';
    jshtml += '</table>';
    jshtml += '</div>';
    if(endFrame !== undefined)
    {
        jshtml+=endFrame;
    }
    if(tableConfig.renderTo === 'script'){
		return jshtml;
	}
    if (tableConfig.renderTo !== undefined) {
        var el = document.getElementById(tableConfig.renderTo);
		replaceHtml(el, jshtml)
		//el.innerHTML = jshtml;
    }
    else {
        window.document.write(jshtml);
    }
}


// show quotes table
renderQuotes = function () {
    globalCurrentCmp++;
    if (sessionId === undefined) {
        startConnection();
    }
    
    window['quotesList' + globalCurrentCmp] = {
        id: 'gridid-quotesList',
        renderers: {
            f10: { fn: function (grid, rec, cellid, val, oldval, fxy) {
                var moneysymbol= "";
				var value = '<span>' + moneysymbol + val + '</span>';
                if (val > oldval) {
                    value = '<span style="color:#83A508; background-color:#E9E9EA;">' + moneysymbol + val + '</span>';
                } else if (val < oldval) {
                    value = '<span style="color:red; background-color:#E9E9EA;">' + moneysymbol + val + '</span>';
                }
                return value;
            },
                hightlightInterval: 1000
            },
              f11: { fn: function (grid, rec, cellid, val, oldval, fxy) {
                var moneysymbol= "";
				var value = '<span>' + moneysymbol + val + '</span>';
                if (val > oldval) {
                    value = '<span style="color:#83A508; background-color:#E9E9EA;">'+ moneysymbol + val + '</span>';
                } else if (val < oldval) {
                    value = '<span style="color:red; background-color:#E9E9EA;">'+ moneysymbol + val + '</span>';
                }
                return value;
            },
                hightlightInterval: 1000
            },
            f25: {
                fn: function (grid, rec, cellid, val, oldval, fxy) {
                    var realSymbol = rec.realSymbol;
                    if (rec.realSymbol === undefined) {
                        realSymbol = rec.symbol;
                    }

                    if (val == undefined) {
                        val = "";
                    } else  if(rec.newName.f25 != undefined){
                        val = rec.newName.f25;
                    }
                    
                    return '<span title="' + val + '">' + val + '</span>';

                }
            },
            f15: {
                fn: defaultRenderers.f15
            }
        },

        records: [],
        columns: { f25: 0, f6: 0, f14: 0, f15: 0, f17: 0, f10: 0, f11: 0, f4:0, f2:0, f3: 0, f1:0 }// here you can select the fields you want to show on the QL
    };
    

    var instr = [];
    //set the instruments you want to show
    for(var i = 0; i <instruments.length; i++)
    {
        instr.push({
		    r: getReqObjPrice(instruments[i], provider, true),
		    f25: instrumentsNames[i]
		});
    }


    var cmp = window['quotesList' + globalCurrentCmp];
    var arrQuotesReq = [];

    for (var ii = 0; ii < instr.length; ii++) {
        cmp.records.push({
            id: 'recid-' + instr[ii].r.i,
            symbol: instr[ii].r.s,
            //data: {f25: instr[ii].f25}
            data: {},
            newName: { f25: instr[ii].f25 },
            provider: instr[ii].r.p
        });
        arrQuotesReq.push(instr[ii].r);
    }

    appendRequests(arrQuotesReq);

    cmp.instr = instr;
    cmp.contentType = 'indexes';
    cbfunctions.push({
        update: cbf_update,
        cmp: cmp
    });



    //define column names
    var fields = {
        f25: { name: 'Live Metals Feed', value: '', width: 48, hdTDcls: 'hdTDClsLeft', TDCls: 'TDCls', cellCls: 'nameColumn', hdCellCls: 'nameHeaderClass' },
        f10: { name: 'Bid', value: '', width: 40, hdTDcls: 'hdTDClsRight', TDCls: 'TDClsRight', cellCls: 'kursColumn', hdCellCls: 'gridDefaultHeader' },
        f11: { name: 'Ask', value: '', width: 40, hdTDcls: 'hdTDClsRight', TDCls: 'TDClsRight', cellCls: 'changeColumn', hdCellCls: 'gridChangeHeader' },
        f14: { name: '+/- $', value: '', width: 35, hdTDcls: 'TDClsRight', TDCls: 'TDClsRight', cellCls: 'changeColumn', hdCellCls: 'gridChangeHeader' },
        f15: { name: '% Change', value: '', width: 35, hdTDcls: 'TDClsRight', TDCls: 'TDClsRight', cellCls: 'changeColumn', hdCellCls: 'gridChangeHeader' },
        f4: { name: 'Open', value: '', width: 40, hdTDcls: 'TDClsRight', TDCls: 'TDClsRight', cellCls: 'changeColumn', hdCellCls: 'gridChangeHeader' },
        f2: { name: 'High', value: '', width: 40, hdTDcls: 'TDClsRight', TDCls: 'TDClsRight', cellCls: 'changeColumn', hdCellCls: 'gridChangeHeader' },
        f3: { name: 'Low', value: '', width: 35, hdTDcls: 'TDClsRight', TDCls: 'TDClsRight', cellCls: 'changeColumn', hdCellCls: 'gridChangeHeader' },
        f1: { name: 'Close', value: '', width: 35, hdTDcls: 'TDClsRight', TDCls: 'TDClsRight', cellCls: 'changeColumn', hdCellCls: 'gridChangeHeader' },
        f17: { name: 'Time', value: '', width: 50, hdTDcls: 'TDClsRight', TDCls: 'TDClsRight', cellCls: 'changeColumn', hdCellCls: 'gridChangeHeader' }
    };
 
     cmp.columns.f14 = 0;
        cmp.columns.f17 = 0;
        cmp.renderers.f17 = {
            fn: defaultRenderers.f17
        };

    //configure quotes table
    var tableConfig = {
        instr: cmp,
        fields: fields,
        contentClass: '',
        contentOddClass: '',
        hideHeaders: false
    };
    renderTable(tableConfig);
};

