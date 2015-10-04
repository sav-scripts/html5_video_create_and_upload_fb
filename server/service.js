/**
 * Created by sav on 2015/9/23.
 */



var Facebook = require('facebook-node-sdk');


var engine = require('engine.io');
var server = engine.listen(3003);
var fs = require("fs");
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var del = require('del');

server.on('connection', function(socket)
{
    console.log("on connect");

    var _accessToken = null;
    var _fb = new Facebook({ appID: '707610362588047', secret: '8a5c9bf2053f8ef7d5218e9c936fdfd7', fileUpload: true });

    socket.on('message', function (data)
    {
        //console.log("on message, data = " + data);

        var obj, errorObj, cmd, params;

        try{ obj = JSON.parse(data); }
        catch(e)
        {
            console.log("got none JSON message: " + data);
            return;
        }

        cmd = obj.cmd;
        params = obj.params;


        if(obj.cmd == "userLogin")
        {
            _accessToken = obj.params.accessToken;

            //console.log("got accessToken: " + _accessToken);

            _fb.setAccessToken(_accessToken);
            //fbTest();
            sendResponse();


        }
        else if(cmd == "uploadVideo")
        {
            uploadVideo();
        }
        else if(cmd == "createVideo")
        {
            createVideo(function(success)
            {

                if(success)
                {
                    del(['./tmp/*.jpg']).then(function (paths)
                    {
                        sendResponse(true);
                    });
                }
                else
                {
                    sendResponse(false, {error:"video create fail"});
                }
            });

        }
        else if(cmd == "uploadImage")
        {
            var imageData = params.imageData;
            var index = params.index;
            var serial = String(10000 + index).toString().substr(1);

            mkdirp('./tmp', function (err)
            {
                if (err)
                {
                    console.log(err);
                    sendResponse(false, {error:"fail when creating folder"});
                }
                else
                {
                    fs.writeFile("./tmp/image_"+serial+".jpg", imageData, 'base64', function(err)
                    {
                        //console.log("error = " + err);
                        if(err)
                        {
                            console.error(err);
                            sendResponse(false, {error:"upload image fail"});
                        }
                        else
                        {
                            sendResponse(true, {index:index});
                        }
                    });
                }
            });


        }
        else
        {
            console.log("unsupported cmd: " + obj.cmd);
        }


        function sendResponse(success, params)
        {
            if(success == null) success = true;
            if(!params) params = {};
            params.success = success;
            socket.send(getResponse(obj, params));
        }

        //function fbTest()
        //{
        //    _fb.api('/me', function(err, data)
        //    {
        //        console.log("err = " + err);
        //        console.log("data = " + JSON.stringify(data)); // => { id: ... }
        //    });
        //}

        function createVideo(cb)
        {
            console.log("creating video");
            exec('ffmpeg -framerate 30 -y -i tmp\\image_%04d.jpg -c:v libx264 -r 30 -pix_fmt yuv420p tmp\\out.mp4', function(err, data)
            {
                if(err)
                {
                    console.log("error = " + err);
                    cb.apply(null, [false]);
                }
                else
                {
                    cb.apply(null, [true]);
                }
            });
        }

        function uploadVideo()
        {
            console.log("uploading video");
            _fb.api("/me/videos", 'post', {
                source: '@' + __dirname  + "/tmp/out.mp4",
                title : "test video",
                description : "upload video via nodejs test"
            }, function(err, data) {

                if (err) return console.error(err);


                console.log(JSON.stringify(data));

                if(err)
                {
                    //console.error(err);
                    sendResponse(false, {error:err});
                }
                else
                {
                    sendResponse(true, {id:data.id});
                    /*
                    socket.send(getResponse(obj,
                        {
                            success:true,
                            id:data.id
                        }));
                        */
                }

                //console.info("video uploaded");
            });
        }

    });

    socket.on('close', function ()
    {
        console.log("on close");

    });


});

// misc methods
function getResponse(obj, params)
{
    if(params == null) params = {success:true};
    return JSON.stringify({cmd: obj.cmd, timestamp: obj.timestamp, type:"response", params:params});
}



