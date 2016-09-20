

$(document).ready(function() {
  /*
  $('#save').click(function(e) {
    e.preventDefault;
    var button = $(this);
    button.addClass("btn-warning");
    button.html('Saving ...');

    var data = {};

    data = $('#calForm').serializeArray();


    console.log(data);

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

    return false;
  });
  */
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
