
    //load images into preview containers
    //if previews >12, show 12 and add a page.
  var img = new Image();
  var div = document.getElementById('iconPview');

  img.onload = function() {
    div.appendChild(img);
  };

  img.src = '~\images\bird.png';
