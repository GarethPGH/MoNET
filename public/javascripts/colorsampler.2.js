var socket = io();


$(document).ready(function() {

  var color;

  var fileinput = document.getElementById('camera');

  var max_width = fileinput.getAttribute('data-maxwidth');
  var max_height = fileinput.getAttribute('data-maxheight');

  var preview = document.getElementById('preview');

  var form = document.getElementById('file-holder');

  function processfile(file) {

    if (!(/image/i).test(file.type)) {
      alert("File " + file.name + " is not an image.");
      return false;
    }

    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function(event) {
      // blob stuff
      var blob = new Blob([event.target.result]); // create blob...
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); // and get it's URL

      // helper Image object
      var image = new Image();
      image.src = blobURL;
      preview.appendChild(image); // preview commented out, I am using the canvas instead
      image.onload = function() {
        var canvas = document.getElementById('canvas');
    		// Create an empty project and a view for the canvas:
    		paper.setup(canvas);

        var raster = new paper.Raster({source: image.src});

        raster.on('load', function () {
          var width = raster.size.width;
          var height = raster.size.height;

          // calculate the width and height, constraining the proportions
          if (width > height) {
            if (width > max_width) {
              //height *= max_width / width;
              height = Math.round(height *= max_width / width);
              width = max_width;
            }
          } else {
            if (height > max_height) {
              //width *= max_height / height;
              width = Math.round(width *= max_height / height);
              height = max_height;
            }
          }

          raster.height = height;
          raster.width = width;
          raster.position = new paper.Point(width/2,height/2);
          var rect = new paper.Rectangle(0,0,width,height);
          var avgColor = raster.getAverageColor(rect);

          //console.log(avgColor);

          var rgb = {};

          rgb.red = parseInt(avgColor.components[0] * 255);
          rgb.green = parseInt(avgColor.components[1] * 255);
          rgb.blue = parseInt(avgColor.components[2] * 255);

          $('body').css("background-color", "rgb(" + rgb.red + "," + rgb.green + "," + rgb.blue + ")");
          $('#message').html("Great! If you like your color, add it to the wall. If not choose or take a new picture.");
          $('#add-cell').show();
          $('#file-holder').removeClass('btn-danger').addClass('btn-info');
          $('#file-holder span').html('Get a better color!');

          color = rgb;
          color.source = 'camera';
          color.x = Math.floor(Math.random() * (2000));
          color.y = Math.floor(Math.random() * (1000));


        });

    		// Draw the view now:
    		//paper.view.draw();
        // have to wait till it's loaded
        //var resized = resizeMe(image); // send it to canvas
        //var newinput = document.createElement("input");
        //newinput.type = 'hidden';
        //newinput.name = 'images[]';
        //newinput.value = resized; // put result from canvas into new hidden input
        //form.appendChild(newinput);

      };
    };
  }

  function readfiles(files) {

    // remove the existing canvases and hidden inputs if user re-selects new pics
    var existinginputs = document.getElementsByName('images[]');
    var existingcanvases = document.getElementsByTagName('canvas');
    while (existinginputs.length > 0) { // it's a live list so removing the first element each time
      // DOMNode.prototype.remove = function() {this.parentNode.removeChild(this);}
      form.removeChild(existinginputs[0]);
      existingcanvases[0].remove();
    }

    for (var i = 0; i < files.length; i++) {
      processfile(files[i]); // process each file at once
    }
    fileinput.value = ""; //remove the original files from fileinput
    // TODO remove the previous hidden inputs if user selects other files
  }

  // this is where it starts. event triggered when user selects files
  fileinput.onchange = function() {
    $('#file-holder').removeClass('btn-info').addClass('btn-danger');
    $('#file-holder span').html('Processing ...');
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
      alert('The File APIs are not fully supported in this browser.');
      return false;
    }
    readfiles(fileinput.files);
  };


  $('#add').click(function() {
    console.log(color);
    socket.emit('new color', color);
  });

  $('#reload').click(function() {
    location.reload();
  });

  socket.on('add success', function(id) {
    $('#message').html("Your color has been added to the painting queue. Thanks for helping us create this work of art!");
    $('#file-holder span').html('Add another color!');
    $('#add').hide();

  });

  socket.on('message', function(message) {
    console.log(message);
  });

});
