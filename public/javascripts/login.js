$(document).ready(function() {

  $('.save').click(function(e) {
    e.preventDefault;
    var button = $(this)
    var id = $(this).attr("for");
    var data = $('[id=' + id + ']').serializeObject();
    data.elevated = !data.elevated ? false : true;
    button.addClass("btn-warning");
    button.children('i').addClass('fa-spin');

    $.ajax({
      contentType: "application/json",
      url: '/private/users/',
      type: 'PUT',
      processData: false,
      data: JSON.stringify(data),
      success: function(data) {
        button.removeClass("btn-warning");
        button.children('i').removeClass('fa-spin');
      }
    });

    return false;
  });


});
