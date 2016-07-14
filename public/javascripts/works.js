$(document).ready(function() {

  $('.in-slider').change(function() {
    var value = $(this).val();
    var max = parseInt($(this).siblings('[class*="slider"]').attr('max'));
    var min = parseInt($(this).siblings('[class*="slider"]').attr('min'));
    if (value > max) value = max;
    if (value < min) value = min;
    $(this).val(value);
    $(this).siblings('[class*="slider"]').slider("value", value);
  });

  $('.slider').each(function(index, el) {
    console.log(el);
    $(el).slider({
      min: parseInt($(el).attr('min')),
      max: parseInt($(el).attr('max')),
      disabled: $(el).attr('disabled'),
      orientation: 'vertical',
      value: $(el).attr('initalValue'),
      slide: function(event, ui) {
        var dataId = $(el).attr('dataId');
        var param = $(el).attr('param');
        $('input[dataId=' + dataId + '][param=' + param + ']').val($(el).slider('values', 0));
      },
      stop: function(event, ui) {
        var dataId = $(el).attr('dataId');
        var param = $(el).attr('param');
        $('input[dataId=' + dataId + '][param=' + param + ']').val($(el).slider('values', 0));
      }
    });
  })

  $('#addJob').click(function () {
    var data = {
      action : 'add'
    }

    $.ajax({
      contentType: "application/json",
      url: '/private/works/',
      type: 'PUT',
      processData: false,
      data: JSON.stringify(data),
      success: function(data) {
        console.log(data);
      }
    });

    location.reload();
    return false;

  });

  $('.wc-play').click(function() {
    var data = {
      action: 'play',
      id: $(this).attr('data-id')
    }

    $.ajax({
      contentType: "application/json",
      url: '/private/works/',
      type: 'PUT',
      processData: false,
      data: JSON.stringify(data),
      success: function(data) {
        console.log(data);
      }
    });

    location.reload();
    return false;

  });


    $('.wc-pause').click(function() {
      var data = {
        action: 'pause',
        id: $(this).attr('data-id')
      }

      $.ajax({
        contentType: "application/json",
        url: '/private/works/',
        type: 'PUT',
        processData: false,
        data: JSON.stringify(data),
        success: function(data) {
          console.log(data);
        }
      });

      location.reload();
      return false;

    });

});
