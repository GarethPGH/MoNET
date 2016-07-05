var socket = io();

function getUrlVars() {
  var vars = [],
    hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

$(document).ready(function() {
  var stroke = $('[sample_id="' + getUrlVars().id + '"]');
  console.log(stroke);
  stroke.fadeIn(500).fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);

  $('#flash').click(function(e) {
    e.preventDefault;
    console.log('test');
    stroke.fadeIn(500).fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);
  });


  socket.on('message', function(message) {
    var color = message.data;
    $('body').append(
      '<div class="colorsplotch" style="background-color:rgb(' + color.red + ',' + color.green + ',' + color.blue + '); width:50px; height:50px; left:' + color.x + 'px; top:' + color.y + 'px;"> &nbsp</div>'
    )
    console.log(color);
  });

});
