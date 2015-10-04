(function ()
{

    var _p = window.MathHelper = {};

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

}());