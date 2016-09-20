var socket = io();

$(document).ready(function() {

  console.log('derp');

  socket.on('status_update', function(message) {
      console.log(message);
      $('#wifi-icons').removeClass('label-success label-warning label-danger label-info');
      if( message.signal > -67 ) {
        $('#wifi-icons').addClass('label-success');
      } else if (message.signal > -70 ) {
        $('#wifi-icons').addClass('label-warning');
      } else {
        $('#wifi-icons').addClass('label-danger');
      }

      $('#wifi').html(message.signal + 'dB');

      if(message.code == 1 || message.code == 2 || message.code == 17 || message.code == 18) {
        $('#status-row').css('background-color','#333');
      } else {
        $('#status-row').css('background-color','#d9534f');
      }


      $('#status-mess').html(message.message);

      $('#xPos').html(message.xPos);
      $('#yPos').html(message.yPos);

      $('#c').html(message.c);
      $('#y').html(message.y);
      $('#m').html(message.m);
      $('#k').html(message.k);
      $('#w').html(message.w);

      var r = 255 * ( 255 - message.c) * (255 - message.k);
      var g = 255 * ( 255 - message.m) * (255 - message.k);
      var b = 255 * ( 255 - message.y) * (255 - message.k);

      $('.splotch').css('background-color','rgb(' + r + ',' + g + ',' + b + ')');


  });

  setInterval( function () {
    socket.emit('status_request');
  }, 1000);

  $('#modal').click ( function () {
    $('#alert-box').modal('toggle');

  });

});