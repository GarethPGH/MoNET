//Changing this to a javascript object with fields and methods to chain.
function processImage(){
    //Set up all needed variables.
    var color = "";

    //Short cuts for various file upload form elements
    var fileinput = document.getElementById('camera');
    var preview = document.getElementById('preview');
    var form = document.getElementById('file-holder');

    //Get allowed size of uploaded image.
    var max_width = fileinput.getAttribute('data-maxwidth');
    var max_height = fileinput.getAttribute('data-maxheight');

    processImage.prototype.rasterImage = function(max_width, max_height){
        var raster = new paper.Raster({ source: image.src });
        raster.on('load', function () {
            var width = raster.size.width;
            var height = raster.size.height;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > max_width) {
                    height = Math.round(height *= max_width / width);
                    width = max_width;
                }
            } else {
                if (height > max_height) {
                    width = Math.round(width *= max_height / height);
                    height = max_height;
                }
            }

            raster.height = height;
            raster.width = width;

            //Position the image correctly.
            raster.position = new paper.Point(width / 2, height / 2);
        });
    }             

        processImage.prototype.findAvgColor = function(width, height) {

            var rect = new paper.Rectangle(0, 0, width, height);
            var avgColor = raster.getAverageColor(rect);


            var rgb = {};

            //Break out the compenent colors from the average color
            rgb.red = parseInt(avgColor.components[0] * 255);
            rgb.green = parseInt(avgColor.components[1] * 255);
            rgb.blue = parseInt(avgColor.components[2] * 255);


            //Apply average color to page background.
            $('body').css("background-color", "rgb(" + rgb.red + "," + rgb.green + "," + rgb.blue + ")");
            $('#message').html("Great! If you like your color, add it to the wall. If not choose or take a new picture.");
            $('#add-cell').show();
            $('#file-holder').removeClass('btn-danger').addClass('btn-info');
            $('#file-holder span').html('Get a better color!');

            color = rgb;
            color.source = 'camera';
            color.x = Math.floor(Math.random() * (2000));
            color.y = Math.floor(Math.random() * (1000));
        };



    });
    //Put this in a promise
    function processfile(file) {

        //Check if uploaded file is an allowed image type.
        if (!(/image/i).test(file.type)) {
            alert("File " + file.name + " is not an image.");
            return false;
        }

        // read the files
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = function (event) {
            // blob stuff
            var blob = new Blob([event.target.result]); // create blob...
            window.URL = window.URL || window.webkitURL;
            var blobURL = window.URL.createObjectURL(blob); // and get it's URL

            // helper Image object . . . load uploaded file into this for image analysis
            var image = new Image();
            image.src = blobURL;
            preview.appendChild(image);

            //Once image is loaded, hand off to Paper.js for analysis.
            image.onload = function () {
                //Get our canvas element and make it a Paper.js project.
                var canvas = document.getElementById('canvas');
                paper.setup(canvas);

            };
        };

        new processImage(file).rasterImage.findAvgColor;
    };

