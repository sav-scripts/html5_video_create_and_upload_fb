/**
 * Created by sav on 2015/9/23.
 */
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var del = require('del');

function test(){
    //console.log("fun() start");

    /*
    exec('ffmpeg -framerate 24 -y -i images\\image%04d.jpg -c:v libx264 -r 24 -pix_fmt yuv420p videos\\out.mp4', function(err, data) {
        console.log("error = " + err);
        console.log("data = " + data.toString());
    });
    */


    //exec('ffmpeg -framerate 30 -y -i tmp\\image_%04d.jpg -c:v libx264 -r 30 -pix_fmt yuv420p tmp\\out.mp4', function(err, data)
    //{
    //    console.log("error = " + err);
    //    console.log("data = " + data.toString());
    //});


    //mkdirp('./test/foo/bar/baz', function (err) {
    //    if (err) console.error(err)
    //    else console.log('pow!')
    //});

    del(['./tmp/*.jpg']).then(function (paths) {
        console.log('Deleted files/folders:\n', paths.join('\n'));
    });
}
test();