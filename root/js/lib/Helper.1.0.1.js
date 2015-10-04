(function()
{

    "use strict";

    var _p = window.Helper = {};

    _p.getSize_cover = function(containerWidth, containerHeight, contentWidth, contentHeight)
    {
        var containerRatio = containerWidth / containerHeight,
            contentRatio = contentWidth / contentHeight,
            width, height;

        if(contentRatio > containerRatio)
        {
            height = containerHeight;
            width = height * contentRatio;
        }
        else
        {
            width = containerWidth;
            height = width / contentRatio;
        }

        return {width:width, height:height, ratio:width/contentWidth};
    };

    _p.getSize_contain = function(containerWidth, containerHeight, contentWidth, contentHeight)
    {
        var containerRatio = containerWidth / containerHeight,
            contentRatio = contentWidth / contentHeight,
            width, height;

        if(contentRatio > containerRatio)
        {
            width = containerWidth;
            height = width / contentRatio;
        }
        else
        {
            height = containerHeight;
            width = height * contentRatio;
        }

        return {width:width, height:height, ratio:width/contentWidth};
    };


    Helper.extract = function (selector, sourceDom, parentDom, domIndex)
    {
        if (domIndex == null) domIndex = 0;
        if (sourceDom == null) sourceDom = document;

        var dom = $(sourceDom).find(selector).get(domIndex);
        if (!dom) console.error("can't find dom, selector: " + selector + ", source: " + sourceDom);

        Helper.getInitValue(dom);

        if (parentDom != null) parentDom.appendChild(dom);

        return dom;
    };


    Helper.$extract = function (selector, sourceDom, parentDom, domIndex)
    {
        if (domIndex == null) domIndex = 0;
        if (sourceDom == null) sourceDom = document;

        var dom = $(sourceDom).find(selector).get(domIndex);
        if (!dom) console.error("can't find dom, selector: " + selector + ", source: " + sourceDom);

        Helper.getInitValue(dom);

        if (parentDom != null) parentDom.appendChild(dom);

        return $(dom);
    };

    Helper.pxToPercent = function (dom, parentWidth, parentHeight, styleDic, targetObj)
    {
        if(!styleDic) styleDic =
        {
            "w":true,
            "h":false,
            "l":true,
            "t":false,
            "r":true,
            "b":false
        };

        var $dom = $(dom);

        /*
        process("width", parentWidth);
        process("left", parentWidth);
        process("right", parentWidth);

        process("height", parentHeight);
        process("top", parentHeight);
        process("bottom", parentHeight);
        */

        var key;
        for(key in styleDic)
        {
            var value = (styleDic[key] == true)? parentWidth: parentHeight;

            process(key, value);
        }

        function process(key, pValue, rate)
        {
            if (rate == null) rate = 100;

            var cssName = Helper.styleDic[key];
            if(!cssName) cssName = key;

            var v = getValue($dom.css(cssName));

            var finalString = v / pValue * rate + "%";

            if(targetObj)
            {
                targetObj[key] = finalString;
            }
            else
            {
                if (v != 0) $dom.css(cssName, finalString);
            }
        }
    };


    Helper.clearStyles = function(dom)
    {
        $(dom).removeAttr("style");
    };



    Helper.getInitValue = function (dom, ignoreDefault, extraStyles, pxToPercentSetting, clearStyles, mode)
    {
        if(!dom.init) dom.init = {};
        if(!dom.geom) dom.geom = {};

        if(clearStyles) Helper.clearStyles(dom);


        var init, geom;

        if(mode)
        {
            init = dom.init[mode] = {};
            geom = dom.geom[mode] = {};
        }
        else
        {
            init = dom.init;
            geom = dom.geom;
        }


        if(!ignoreDefault)
        {
            if (dom.currentStyle)
            {
                geom.w = init.w = getValue(dom.currentStyle.width);
                geom.h = init.h = getValue(dom.currentStyle.height);
                geom.ml = init.ml = getValue(dom.currentStyle.marginLeft);
                geom.mt = init.mt = getValue(dom.currentStyle.marginTop);
                geom.mr = init.mr = getValue(dom.currentStyle.marginRight);
                geom.mb = init.mb = getValue(dom.currentStyle.marginBottom);
                geom.t = init.t = getValue(dom.currentStyle.top);
                geom.l = init.l = getValue(dom.currentStyle.left);
                geom.r = init.r = getValue(dom.currentStyle.right);
                geom.b = init.b = getValue(dom.currentStyle.bottom);
            }
            else
            {
                geom.w = init.w = $(dom).width();
                geom.h = init.h = $(dom).height();
                geom.ml = init.ml = getValue($(dom).css("margin-left"));
                geom.mt = init.mt = getValue($(dom).css("margin-top"));
                geom.mr = init.mr = getValue($(dom).css("margin-right"));
                geom.mb = init.mb = getValue($(dom).css("margin-bottom"));
                geom.t = init.t = getValue($(dom).css("top"));
                geom.l = init.l = getValue($(dom).css("left"));
                geom.r = init.r = getValue($(dom).css("right"));
                geom.b = init.b = getValue($(dom).css("bottom"));
            }
        }
        geom.scale = init.scale = 1;

        if(extraStyles)
        {
            for(var i=0;i<extraStyles.length;i++)
            {
                var key = extraStyles[i];

                init[key] = geom[key] = getValue($(dom).css(key));
            }
        }


        if(pxToPercentSetting)
        {
            var parentWidth, parentHeight, styleDic;

            parentWidth = pxToPercentSetting.width;
            parentHeight = pxToPercentSetting.height;
            styleDic = pxToPercentSetting.styleDic;

            Helper.pxToPercent(dom, parentWidth, parentHeight, styleDic, init);
        }

//        console.log("width = " + $(dom).css("width"));
        //console.log("width = " + dom.currentStyle.width);

    };

    function getValue(v)
    {
        var v2 = parseInt(v);
        if (isNaN(v2)) v2 = 0;
        return v2;
    }

    Helper.styleDic =
    {
        "l": "left",
        "r": "right",
        "t": "top",
        "b": "bottom",
        "ml": "margin-left",
        "mr": "margin-right",
        "mt": "margin-top",
        "mb": "margin-bottom",
        "w": "width",
        "h": "height"
    };

    Helper.applyTransform = function (dom, scaleRate, styleList, percentStyleList, plainApplyList, mode)
    {
        var init, geom;

        if(mode)
        {
            init = dom.init[mode];
            geom = dom.geom[mode];
        }
        else
        {
            init = dom.init;
            geom = dom.geom;
        }

        var rate = (scaleRate != null) ? init.scale * scaleRate : init.scale;

        var $dom = $(dom);

        var i, n, key, style;
        if (styleList)
        {
            n = styleList.length;
            for (i = 0; i < n; i++)
            {
                key = styleList[i];
                style = Helper.styleDic[key];
                if(!style) style = key;
                geom[key] = init[key] * rate;
                $dom.css(style, geom[key] + "px");
            }
        }

        if (percentStyleList)
        {
            n = percentStyleList.length;
            for (i = 0; i < n; i++)
            {
                key = percentStyleList[i];
                style = Helper.styleDic[key];
                geom[key] = init[key] * rate;
                $dom.css(style, geom[key] + "%");
            }
        }

        if(plainApplyList)
        {
            n = plainApplyList.length;
            for (i = 0; i < n; i++)
            {
                key = plainApplyList[i];
                style = Helper.styleDic[key];
                if(!style) style = key;

                $dom.css(style, init[key]);
            }
        }
    };

    Helper.transformDom = function (dom, scaleRate, applyPosition, applyMargin, applyScale)
    {
        var rate = (scaleRate != null) ? dom.init.scale * scaleRate : dom.init.scale;

        if (applyScale != false)
        {
            if (applyScale === true)
            {
                dom.geom.w = dom.init.w * rate;
                dom.geom.h = dom.init.h * rate;
                $(dom).css("width", dom.geom.w).css("height", dom.geom.h);
            }
            else
            {
                if (applyPosition.l)
                {
                    dom.geom.l = dom.init.l * rate;
                    $(dom).css("left", dom.geom.l);
                }
                if (applyPosition.t)
                {
                    dom.geom.t = dom.init.t * rate;
                    $(dom).css("top", dom.geom.t);
                }
            }
        }

        if (applyPosition != false)
        {
            if (applyPosition === true)
            {
                dom.geom.t = dom.init.t * rate;
                dom.geom.l = dom.init.l * rate;
                $(dom).css("top", dom.geom.t).css("left", dom.geom.l);
            }
            else
            {
                if (applyPosition.l)
                {
                    dom.geom.l = dom.init.l * rate;
                    $(dom).css("left", dom.geom.l);
                }
                if (applyPosition.t)
                {
                    dom.geom.t = dom.init.t * rate;
                    $(dom).css("top", dom.geom.t);
                }
                if (applyPosition.r)
                {
                    dom.geom.r = dom.init.r * rate;
                    $(dom).css("right", dom.geom.r);
                }
                if (applyPosition.b)
                {
                    dom.geom.b = dom.init.b * rate;
                    $(dom).css("bottom", dom.geom.b);
                }
            }
        }

        if (applyMargin != false)
        {
            if (applyMargin === true)
            {
                dom.geom.mt = dom.init.mt * rate;
                dom.geom.ml = dom.init.ml * rate;
                $(dom).css("margin-top", dom.geom.mt).css("margin-left", dom.geom.ml);
            }
            else
            {
                if (applyPosition.ml)
                {
                    dom.geom.ml = dom.init.ml * rate;
                    $(dom).css("margin-left", dom.geom.ml);
                }
                if (applyPosition.mt)
                {
                    dom.geom.mt = dom.init.mt * rate;
                    $(dom).css("margin-top", dom.geom.mt);
                }
                if (applyPosition.mr)
                {
                    dom.geom.mr = dom.init.mr * rate;
                    $(dom).css("margin-right", dom.geom.mr);
                }
                if (applyPosition.mb)
                {
                    dom.geom.mb = dom.init.mb * rate;
                    $(dom).css("margin-bottom", dom.geom.mb);
                }
            }
        }
    };

}());