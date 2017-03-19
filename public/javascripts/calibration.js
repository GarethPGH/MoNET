//check if there is a way you can run document.ready on the whole thing once in intialized program
 

$(document).ready(function() {
  
  $('#save').click( function (e) {
    var data = $('form').serializeObject();
    console.log(data);
    e.preventDefault();
    var button = $(this);
    button.addClass("btn-warning");
    button.html('Saving ...');

        $.ajax({
          contentType: "application/json",
          url: '/calibration/',
          type: 'PUT',
          processData: false,
          data: JSON.stringify(data),
          success: function(data) {
            button.removeClass("btn-warning");
            button.html('Save');
            console.log(data);
          }
        });



  });


});
