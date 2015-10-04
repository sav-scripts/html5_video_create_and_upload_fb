module.exports = function(grunt) {

    var pngquantPlugin = require('imagemin-pngquant');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            }/*,
            expand: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '*.js',
                    dest: 'expand'
                }]
            }*/,
            "combinejs":{
                options:{
                    sourceMap: false
                },
                files:{
                    "root/js_min/all.min.js":["root/js/*.js", "root/js/lib/*.js"]
                }
            }
        },
        watch:{
            options: { nospawn: true },
            scripts: {
                files: ['src/*.js'],
                tasks: ['minify'],
                ext: ".js"
            }
        },
        pngmin: {
            compile: {
                options: {
                    ext: ".png"
                },
                files: [
                    {
                        src: 'root/images/*.png',
                        dest: 'root/images_min/'
                    }
                ]
            }
        },
        imagemin: {
            options:{
                use: [pngquantPlugin()]
            },
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'root/images/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'root/images_min/'
                }]
            }
        },
        less:{
            development: {
                options: {
                    paths: ["root"]
                },
                files: {
                    "root/css/style.css": "root/less/style.less"
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-newer');

    // Default task(s).
    //grunt.registerTask('minify', ['newer:uglify:expand']);
    grunt.registerTask("combinejs", ["uglify:combinejs"]);
    grunt.registerTask('images', ['newer:imagemin']);

    grunt.registerTask('default', ['combinejs', 'newer:less', 'images']);

};