if(window.location.href.indexOf("192") > -1) {
  var socket = io();
} else {
  var socket = io('http://www.projectmo.net:8000');
}


$(document).ready(function() {

  var color;

  var fileinput = document.getElementById('camera');

  var max_width = fileinput.getAttribute('data-maxwidth');
  var max_height = fileinput.getAttribute('data-maxheight');

  var preview = document.getElementById('preview');

  var form = document.getElementById('file-holder');

  var image;

  var raster;
  var origHeight;
  var origWidth;

  var rectFrame;

  var frame;
  var frame2;

  function refreshFrame() {
    rectFrame.center = paper.view.center;
    if(typeof(frame) !== 'undefined') {
      frame.remove();
    }
    if(typeof(frame2) !== 'undefined') {
      frame2.remove();
    }
    frame2 = new paper.Path.Rectangle(rectFrame);
    frame2.strokeWidth = 2;
    frame2.strokeColor = 'white';


    frame = new paper.Path.Rectangle(rectFrame);
    frame.strokeWidth = 2;
    frame.strokeColor = 'black';
    frame.dashArray = [10,4];

    frame.position = paper.view.center;
    frame2.position = paper.view.center;

  }


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
      image = new Image();
      image.src = blobURL;
      preview.appendChild(image); // preview commented out, I am using the canvas instead
      image.onload = function() {
        var canvas = document.getElementById('canvas');
    		// Create an empty project and a view for the canvas:
    		paper.setup(canvas);

        raster = new paper.Raster({source: image.src});

        raster.on('load', function () {
          var width = raster.size.width;
          var height = raster.size.height;

          origHeight = height;
          origWidth = width;

          raster.position = paper.view.center;

          rectFrame = new paper.Rectangle(0,0,360,480);
          refreshFrame();

          var tool = new paper.Tool();

          // Define a mousedown and mousedrag handler
        		tool.onMouseDown = function(event) {
              raster.position = event.point;
        		};

        		tool.onMouseDrag = function(event) {
        			raster.position = event.point;
        		};


          /*
          for (var y = raster.position.y; y < raster.size.height; y++) {
        		for(var x = raster.position.x; x < raster.size.width; x++) {
        			// Get the color of the pixel:
        			var dotColor = raster.getPixel(x, y);
              console.log(x);
              console.log(y);
              console.log(dotColor);
        			// Create a circle shaped path:
        			var path = new paper.Path.Circle({
        				center: new paper.Point(x*5, y*5),
        				radius: 2
        			});

        			// Set the fill color of the path to the color
        			// of the pixel:
        			path.fillColor = dotColor;
        		}
        	}
          raster.remove();
          */
          paper.view.draw();

          $('#message').html("Great! If you like your color, add it to the wall. If not choose or take a new picture.");
          $('#add-cell').show();
          $('#file-holder').removeClass('btn-danger').addClass('btn-info');
          $('#file-holder span').html('Get a better color!');


          //console.log(avgColor);
          /*
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
          */

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
        console.log(raster);
        return raster;
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
    $("#splash").slideUp();
    $(".controls").slideDown( function () {
      $('#file-holder').removeClass('btn-info').addClass('btn-danger');
      $('#file-holder span').html('Processing ...');
      if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        alert('The File APIs are not fully supported in this browser.');
        return false;
      }
      readfiles(fileinput.files);
    });
  };


  function monetize(callback) {



    var tempRaster = raster.rasterize();

    var samples = tempRaster.on('load', function () {
      var rastRec = tempRaster.bounds;

      var samples = {
        width : rectFrame.size.height/10,
        height : rectFrame.size.width/10,
        samples : []
      };

      for (var y = rectFrame.topLeft.y; y <= rectFrame.size.height + rectFrame.topLeft.y - 1; y += 10) {
        for(var x = rectFrame.topLeft.x; x <= rectFrame.size.width + rectFrame.topLeft.x - 1; x += 10) {
          // Get the color of the pixel:
          var dotColor = tempRaster.getPixel(((rastRec.topLeft.x * -1 ) + x) * 2, ((rastRec.topLeft.y * -1 ) + y ) * 2);
          //console.log(dotColor);
          // Create a circle shaped path:
          var path = new paper.Path.Circle({
            center: new paper.Point(x+5, y+5),
            radius: 5
          });

          // Set the fill color of the path to the color
          // of the pixel:
          path.fillColor = dotColor;

          var data = {
            x : (x - 15)/10,
            y : (y - 15)/10,
            r : dotColor.components[0] * 255,
            b : dotColor.components[1] * 255,
            g : dotColor.components[2] * 255,
          };

          samples.samples.push(data);
        }
      }
      tempRaster.remove();
      raster.remove();
      console.log(samples);
      callback(samples);
    });
  }


  $('#add').click(function() {
    socket.emit('new color', color);
  });


  socket.on('add success', function(id) {
    window.location.href = "/colorwall1?id=" + id;
  });

  socket.on('message', function(message) {
    console.log(message);
  });

  $( "#slider-xsize" ).slider({
    value:36,
    min: 6,
    max: 36,
    step: 0.5,
    slide: function( event, ui ) {
      $('#canvas-width').html('Canvas Width ' + ui.value + '"');
      rectFrame.size.width = ui.value * 10;
      refreshFrame();

    }
  });

  $( "#slider-ysize" ).slider({
    value:48,
    min: 6,
    max: 48,
    step: 0.5,
    slide: function( event, ui ) {
      $('#canvas-height').html('Canvas Height ' + ui.value + '"');
      rectFrame.size.height = ui.value * 10;
      refreshFrame();

    }
  });

  $( "#slider-picsize" ).slider({
    value:100,
    min: 1,
    max: 200,
    step: 1,
    slide: function( event, ui ) {
      $('#pic-size').html('Picture Size ' + ui.value + '%');
      raster.scale((ui.value/100)/raster.scaling.x);

    }
  });

  $('#monetize').click( function () {
    $('#image-controls').slideUp();
    $('#processing').slideDown();
    monetize(function (samples) {
      console.log(samples);
    });

  });

  $( "#slider-rotate" ).slider({
    value:0,
    min: -180,
    max: 180,
    step: 1,
    slide: function( event, ui ) {
      $('#pic-rotate').html('Picture Rotation ' + ui.value + '&deg;');
      raster.rotate(ui.value - raster.rotation);

    }
  });

});
