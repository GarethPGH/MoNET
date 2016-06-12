$(document).ready(function() {

  tinymce.init({
    selector: '#subtitle',
    inline: true,
    plugins: "link",
  });
  tinymce.init({
    selector: '#monet',
    inline: true,
    plugins: "link",
  });
  tinymce.init({
    selector: '#works',
    inline: true,
    plugins: "link",
  });
  tinymce.init({
    selector: '#social',
    inline: true,
    plugins: "link",
  });
  tinymce.init({
    selector: '#colorwall',
    inline: true,
    plugins: "link",
  });

  $('#save').click(function(e) {
    e.preventDefault;
    var button = $(this);
    button.addClass("btn-warning");
    button.html('Saving ...');

    var data = {};

    for (edId in tinyMCE.editors) {
      data[edId] = tinyMCE.editors[edId].getContent();
    }


    console.log(data);

    $.ajax({
      contentType: "application/json",
      url: '/private/frontpage/',
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

  $('#cancel').click(function(e) {
    e.preventDefault;
    return false;
  })

});
