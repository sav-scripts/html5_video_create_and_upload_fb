/** Utility **/
(function(){

    var _p = window.Utility = {};

    //var _hash = window.location.hash.replace("#", "");

    Utility.onHashChange = function(cb)
    {

        if ("onhashchange" in window) { // event supported?

            window.onhashchange = function (event) {
                hashChanged();
            }
        }
        else { // event not supported:
            var storedHash = window.location.hash;
            window.setInterval(function () {
                if (window.location.hash != storedHash) {
                    storedHash = window.location.hash;
                    hashChanged();
                }
            }, 100);
        }

        function hashChanged()
        {
            //console.log(document.documentElement.scrollTop);
            cb.apply(null, [_p.getHash()]);
        }

        //console.log("check");

        /*
        window.onpopstate = function(event)
        {
            event.preventDefault();
            console.log("onpopstate: " + event);
            cb.apply(null, [_p.getHash()]);
        };
        */
    };

    Utility.getHash = function()
    {
        return window.location.hash.replace("#", "");
    };
    Utility.setHash = function(targetHash)
    {
        //console.log(targetHash);
        window.location.hash = "#" + targetHash;
        //history.pushState(null, null, "#" + targetHash);
    };


    var _oldConsoleMethod = {};
    var _consoleMethods = {};
    _consoleMethods["log"] = "log";
    _consoleMethods["warn"] = "warn";
    _consoleMethods["error"] = "error";
    _consoleMethods["debug"] = "debug";
    _consoleMethods["info"] = "info";

    Utility.setConsoleMethod = function(methodName/*string*/, enableIt/*boolean*/)
    {
        (enableIt == true) ? console[methodName] = _oldConsoleMethod[methodName] : console[methodName] = function(){};
    };

    Utility.disableAllConsoleMethods = function()
    {
        for(var key in _consoleMethods) this.setConsoleMethod(key, false);
    };

    Utility.enableAllConsoleMethods = function()
    {
        for(var key in _consoleMethods) this.setConsoleMethod(key, true);
    };

    (function()	{
        /** fix console methods for some browser which don't support it **/
        if(!window.console){
            window.console = {};
            for(var key in _consoleMethods){ console[_consoleMethods[key]] = function(){}; }
        }

        // store old console methods
        for(var key in _consoleMethods){ _oldConsoleMethod[_consoleMethods[key]] = console[_consoleMethods[key]]; }

        /** fix Array indexOf method **/
        if (!window.Array.prototype.indexOf)
        {
            window.Array.prototype.indexOf = function(elt /*, from*/)
            {
                var len = this.length >>> 0;

                var from = Number(arguments[1]) || 0;
                from = (from < 0)
                    ? Math.ceil(from)
                    : Math.floor(from);
                if (from < 0)
                    from += len;

                for (; from < len; from++)
                {
                    if (from in this &&
                        this[from] === elt)
                        return from;
                }
                return -1;
            };
        }
    }());

    var _testedUrls = {};
    Utility.analyzeURL = function(url)
    {
        if(!_testedUrls[url])
        {
            var pattern = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
            _testedUrls[url] = url.match(pattern);
        }

        return _testedUrls[url];
    };

    Utility.getPath = function(url)
    {
        /*
        if(!url) url = window.location.href;
        var array = Utility.analyzeURL(url);

        return url.replace(array[7], "");
        */
        if(!url) url = window.location.href;

        //var rest = (location.pathname+location.search).substr(1);

        var string = url.indexOf('?') == -1? url: url.substr(0, url.indexOf('?'));

        if(string.indexOf('#') == -1) return string;
        else return string.substr(0, string.indexOf('#'));

    };

    Utility.getProtocol = function(url)
    {
        if(!url) url = window.location.href;
        return Utility.analyzeURL(url)[2];
    };

    Utility.urlParams = (function()
    {
        var url = decodeURIComponent(window.location.href);
        var paramString = url.split("?")[1];
        if(!paramString) { return {}; }
        paramString = paramString.split("#")[0];
        var urlParams = {};
        var array = paramString.split("&");

        for(var i=0;i<array.length;i++)
        {
            var array2 = array[i].split("=");
            urlParams[array2[0]] = array2[1];
        }
        return urlParams;
    }());

    Utility.isLocalhost = (function()
    {
        var address = window.location.toString().split("/")[2];
        return (address == "localhost" || address.split(".")[0] == "192");
    }());

    Utility.preloadImages = function(urlList, cb, cbUpdateProgress, allowError)
    {
        if(allowError == null) allowError = true;
        if(!urlList || urlList.length == 0){ if(cb) cb.apply(); return; }

        var i = 0;
        loadUrl();
        function loadUrl()
        {
            if(cbUpdateProgress) cbUpdateProgress.apply(null, [(i/urlList.length*100)<<0]);
            if(i >= urlList.length) { if(cb)cb.apply(); return; }

            var url = urlList[i];
            var setting = null;

            if(!(typeof url === "string"))
            {
                setting = url;
                url = setting.url;
            }

            i++;
            var imageDom = new Image();
            imageDom.onload = toNext;
            if(allowError) imageDom.onerror = function(){ console.error("load image error: ["+url+"]"); toNext(); };
            imageDom.src = url;

            function toNext()
            {
                if(setting != null) setting.collector[setting.name] = imageDom;
                imageDom.onerror = null; imageDom.onload = null; loadUrl();
            }
        }
    };

    Utility.callScript = function(url, dataObj, cb, method, cbFail)
    {
        if(!$.ajax){ console.error("jquery need be loaded first"); return; }

        if(method == null) method = "GET";
        var timeout = 20000;
        var dataType = "text";

        if(dataObj) console.info("sending data: " + JSON.stringify(dataObj));

        $.ajax({
            type: method,
            dataType: dataType,
            timeout: timeout,
            url: url,
            data: dataObj,
            success: dataLoaded,
            error:ajaxError
        });

        function dataLoaded(data, textStatus, jqXHR)
        {
            data = data.replace(/\t/g, "");
            console.info("data = " + data);

            var obj = JSON.parse(data);
            if(cb != null) cb.apply(null, [obj]);
        }

        function ajaxError(evt)
        {
            console.log("ajax error, status: " + evt.status + ", statusText: " + evt.statusText);
            if(cbFail) cbFail.apply();
        }
    }

    Utility.shuffleArray = function (o)
    {
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    Utility.loadScript = function(type, url, cbSuccess)
    {
        var oXmlHttp = getHttpRequest() ;
        oXmlHttp.onreadystatechange = function()
        {
            if ( oXmlHttp.readyState == 4 )
            {
                if ( oXmlHttp.status == 200 || oXmlHttp.status == 304 )
                {
                    if(cbSuccess) cbSuccess.apply(null, [oXmlHttp.responseText]);
                }
                else alert( 'XML request error: ' + oXmlHttp.statusText + ' (' + oXmlHttp.status + ')' + ", url: " + url ) ;
            }
        }

        try{
            oXmlHttp.open('GET', url, true);
            oXmlHttp.send(null);
        }
        catch(e)
        {
            if(!("withCredentials" in oXmlHttp))
            {
                if(window.XDomainRequest)
                {
                    sendXDomainRequest(url, function(responseText)
                    {
                        if(cbSuccess) cbSuccess.apply(null, [oXmlHttp.responseText]);
                    });
                }
                else alert("XMLHttpRequest error: " + e + ", on url: " + url);
            }
            else alert("XMLHttpRequest error: " + e + ", on url: " + url);
        }
    };

    Utility.includeJS = function(url, content, id)
    {
        var headDom = document.getElementsByTagName('HEAD').item(0);
        var scriptDom = document.createElement( "script" );
        scriptDom.language = "javascript";
        scriptDom.type = "text/javascript";
        if(id) scriptDom.id = id;
        scriptDom.defer = true;
        scriptDom.text = content;
        headDom.appendChild( scriptDom );

        console.info("JS embed: [" + url + "]");
    };

    Utility.includeCSS = function(url, content, id)
    {
        var headDom = document.getElementsByTagName('HEAD').item(0);

        var scriptDom=document.createElement("link");
        scriptDom.setAttribute("rel", "stylesheet");
        scriptDom.setAttribute("type", "text/css");
        scriptDom.setAttribute("href", url);
        if(id) scriptDom.setAttribute("id", id);
        headDom.appendChild( scriptDom );;

        console.info("CSS embed: [" + url + "]");
    };

    Utility.checkPID = function(idStr)
    {
        // 依照字母的編號排列，存入陣列備用。
        var letters = ['A', 'B', 'C', 'D',
            'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
            'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
            'X', 'Y', 'W', 'Z', 'I', 'O'];
        // 儲存各個乘數
        var multiply = [1, 9, 8, 7, 6, 5,
            4, 3, 2, 1];
        var nums = new Array(2);
        var firstChar;
        var firstNum;
        var lastNum;
        var total = 0;
        // 撰寫「正規表達式」。第一個字為英文字母，
        // 第二個字為1或2，後面跟著8個數字，不分大小寫。
        var regExpID=/^[a-z](1|2)\d{8}$/i;
        // 使用「正規表達式」檢驗格式
        if (idStr.search(regExpID)==-1) {
            // 基本格式錯誤
            //alert("請仔細填寫身份證號碼");
            return false;
        } else {
            // 取出第一個字元和最後一個數字。
            firstChar = idStr.charAt(0).toUpperCase();
            lastNum = idStr.charAt(9);
        }
        // 找出第一個字母對應的數字，並轉換成兩位數數字。
        for (var i=0; i<26; i++) {
            if (firstChar == letters[i]) {
                firstNum = i + 10;
                nums[0] = Math.floor(firstNum / 10);
                nums[1] = firstNum - (nums[0] * 10);
                break;
            }
        }
        // 執行加總計算
        for(var i=0; i<multiply.length; i++){
            if (i<2) {
                total += nums[i] * multiply[i];
            } else {
                total += parseInt(idStr.charAt(i-1)) *
                multiply[i];
            }
        }
        // 和最後一個數字比對
        return (10 - (total % 10)) == lastNum;
    };

    /*** private methods ***/
    function sendXDomainRequest(url, cbSuccess, timeout)
    {
        var xdr = new XDomainRequest();

        xdr.onload = function(){ if(cbSuccess) cbSuccess.apply(null, [xdr.responseText]); }
        xdr.onerror = function(e){ alert("XDomainRequest error on url: " + url); }
        xdr.ontimeout = function(){ alert("XDomainRequest timeout on url: " + url); }

        xdr.timeout = (timeout != null)? timeout: 10000;
        xdr.open("GET", url);
        xdr.send();
    }

    function getHttpRequest()
    {
        if ( window.XMLHttpRequest )
            return new XMLHttpRequest() ;
        else if ( window.ActiveXObject )
            return new ActiveXObject("Microsoft.XMLHTTP");
        else alert("browser doesn't support XmlHttpRequest method");
    }

}());

/** PatternSamples **/
(function(){

var PatternSamples = window.PatternSamples = {};
PatternSamples["email"] = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
PatternSamples["phone"] = /^(09)[0-9]{8}$/;
PatternSamples["number"] = /[0-9]/g;
PatternSamples["nonNumber"] = /[^0-9]/g;
PatternSamples["onlySpace"] = /^\s*$/;
PatternSamples["localPhone"] = /^(0)\d{1,3}(-)\d{5,8}$/;
PatternSamples["personId"] = /^[A-Z]{1}[1-2]{1}[0-9]{8}$/;

}());

/** Support Detect **/
(function()
{
    var SupportDetect = window.SupportDetect = {};
    SupportDetect.recoard = {};
    SupportDetect.get = function(featureName)
    {
        if(SupportDetect.recoard[featureName] != undefined) return SupportDetect.recoard[featureName];
        if(SupportDetect[featureName] != null) return SupportDetect[featureName].apply();
        console.error("feature name: [" + featureName + "] is not defined");
        return null;
    };

    SupportDetect.transform = function()
    {
        var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
        for(var i = 0; i < prefixes.length; i++) {
            if(document.createElement('div').style[prefixes[i]] !== undefined) {
                SupportDetect.recoard["transform"] = prefixes[i];
                return prefixes[i];
            }
        }

        SupportDetect.recoard["transform"] = false;
        return false;
    };

    SupportDetect.canvas = function()
    {
        SupportDetect.recoard["canvas"] = !!document.createElement('canvas').getContext;
        return SupportDetect.recoard["canvas"];
    };

    SupportDetect.canvas = function()
    {
        SupportDetect.recoard["video"] = !!document.createElement('video').canPlayType;;
        return SupportDetect.recoard["video"];
    };

}());


/** Browser Detect **/
(function(){
    window.BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.version = this.searchVersion(navigator.userAgent)
                || this.searchVersion(navigator.appVersion)
                || "an unknown version";
            this.OS = this.searchString(this.dataOS) || "an unknown OS";
            this.isMobile = (function() {
                return (navigator.userAgent.indexOf('Mobile') > -1);
                 }());
        },
        searchString: function (data) {
            for (var i=0;i<data.length;i++)	{
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            },
            { 	string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            },
            {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            },
            {
                prop: window.opera,
                identity: "Opera",
                versionSearch: "Version"
            },
            {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            },
            {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            },
            {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            },
            {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            },
            {		// for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            },
            {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            },
            {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            },
            { 		// for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS : [
            {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            },
            {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            },
            {
                string: navigator.userAgent,
                subString: "iPhone",
                identity: "iPhone/iPod"
            },
            {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }
        ]

    };
    BrowserDetect.init();
}());
