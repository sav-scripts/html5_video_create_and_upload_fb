/**
 * Created by sav on 2015/9/17.
 */
(function(){

    "use strict";

    var _p = window.Main = {};

    var _socket,
        _socketURL = "ws://local.savorks.com:3003",
        _fbAppID = "707610362588047",
        _accessToken,
        _canvas,
        _recoardImages = [],
        _isRecoarding = false,
        _duration = 5,
        _container;

    var $mainButton;

    _p.init = function()
    {
        initFB();
        setupLoadImage();
        setupCanvas();

        _canvas = document.getElementById("my_canvas");
        $mainButton = $(".main_button");
        _socket = new SocketHandler(_socketURL, function()
        {
            toRecoardPhase();
        });

    };

    function toRecoardPhase()
    {
        $mainButton.show().text("Recoard Start").on("click", function()
        {
            $mainButton.unbind().hide();

            _isRecoarding = true;
            _recoardImages = [];

            var obj = {v:_duration};
            var tl = new TimelineMax;
            tl.to(obj, _duration, {v:0, ease:Linear.easeNone, onUpdate:function()
            {
                trace("Recoarding ... " + Math.ceil(obj.v));
            }, onComplete:function()
            {
                _isRecoarding = false;

                trace();
                //console.log(_recoardImages[0]);
                toUploadImagePhase();
            }});

        });
    }

    function toUploadImagePhase()
    {
        $mainButton.show().text("Upload Images").on("click", function()
        {
            $mainButton.unbind().hide();
            uploadImages();

        });

        function uploadImages()
        {
            var index = 0;
            uploadOne();

            function uploadOne()
            {
                if(index >= _recoardImages.length)
                {
                    trace();
                    toLoginPhase();
                }
                else
                {
                    trace("Uploading Image: " + index);

                    _socket.send("uploadImage", {imageData:_recoardImages[index], index:index}, function(response)
                    {
                        if(response.success)
                        {
                            index ++;
                            uploadOne();
                        }
                        else
                        {
                            trace(response.error, true);
                        }
                    });
                }
            }

        }
    }

    function toLoginPhase()
    {
        $mainButton.show().text("Share Video").on("click", function()
        {
            if(!_socket.connected) return;

            $mainButton.hide();
            FBHelper.login(["publish_actions"], function(authResponse)
            {
                $mainButton.unbind();
                _accessToken = authResponse.accessToken;
                _socket.send("userLogin", {accessToken:_accessToken}, function(response)
                {
                    //console.log("on login response: " + JSON.stringify(response));

                    if(response.success)
                    {
                        toUploadVideoPhase();
                    }
                    else
                    {
                        trace(response.error, true);
                    }
                });
            }, function()
            {
                $mainButton.show();
            });


        });
    }

    function toUploadVideoPhase()
    {
        trace("Creating Video ...");

        _socket.send("createVideo", null, function(response)
        {
            //console.log("video id: " + response.id);

            if(response.success)
            {
                trace("Uploading Video ...");

                _socket.send("uploadVideo", null, function(response)
                {
                    if(response.success)
                    {
                        trace("Video Uploaded, id: " + response.id + ", Facebook will inform you when video is ready.");
                    }
                    else
                    {
                        trace(response.error, true);
                    }
                });
            }
            else
            {
                trace(response.error, true);
            }

        });

        /*
        $mainButton.show().text("Upload Video").on("click", function()
        {
            $mainButton.unbind().hide();
            trace("Creating and uploading video from server to facebook ...");

            _socket.send("startUpload", null, function(response)
            {
                //console.log("video id: " + response.id);

                if(response.success)
                {
                    trace("Video Uploaded, id: " + response.id);
                }
                else
                {
                    trace(response.error, true);
                }

            });
        });
        */
    }



    function initFB()
    {
        FBHelper.init(_fbAppID, function()
        {
        });
    }

    function setupCanvas()
    {
        var stage = new createjs.Stage("my_canvas");

        var bg = new createjs.Shape();
        bg.graphics.beginFill("White").drawRect(0,0,1280,720);
        stage.addChild(bg);

        var circle = new createjs.Shape();
        circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);

        _container = new createjs.Container();
        var padding = 200
        _container.x = padding;
        _container.y = padding;
        _container.addChild(circle);
        stage.addChild(_container);

        var tl = new TimelineMax({repeat:-1});
        tl.set(_container, {rotation:0});
        tl.to(_container, 1, {x:1280-padding, ease:Power1.easeInOut});
        tl.to(_container, 1, {y:720-padding, ease:Power1.easeInOut});
        tl.to(_container, 1, {x:padding, ease:Power1.easeInOut});
        tl.to(_container, 1, {y:padding, ease:Power1.easeInOut});
        tl.to(_container, 4, {ease:Linear.easeNone, rotation:360}, 0);

        createjs.Ticker.setFPS(30);
        createjs.Ticker.addEventListener("tick", update);

        function update()
        {
            stage.update();
            //console.log("update");
            if(_isRecoarding)
            {
                _recoardImages.push(_canvas.toDataURL("image/jpeg", .92).replace(/^data:image\/jpeg;base64,/, ""));
            }
        }
    }

    function setupLoadImage()
    {
        var $imageInput = $("#image_input"),
            image;

        $imageInput.on("change", function(event)
        {
            loadImageFile(event.target);
        });

        $(".btn_load_image").on("click", function()
        {
            $imageInput.click();
        });


        function loadImageFile(input)
        {
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (event)
                {
                    loadImg(event.target.result, function()
                    {
                        //CanvasHandler.clear();
                    });
                };

                reader.readAsDataURL(input.files[0]);
            }
        }

        function loadImg(src, cb)
        {
            if(image) $(image).detach();

            image = document.createElement("img");
            image.onload = loaded;

            function loaded()
            {
                //$("body").append(image);

                var bitmap = new createjs.Bitmap(image);
                bitmap.x = -image.width * .5;
                bitmap.y = -image.height * .5;
                _container.removeChildAt(0);
                _container.addChild(bitmap);
            }

            image.src = src;
        }
    }

    function trace(message, isError)
    {
        if(isError == null) isError = false;
        if(message == null) message = "";
        $(".hint_text").toggleClass("error_text", isError).text(message);
    }

}());
