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
        //console.log(el);
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
      });

      function validateForm (target) {

        var formData = $('form[config-for=' + target + ']').serializeObject();

        var data = {
          action : 'update',
          id : target,
          width : formData.width,
          height : formData.height,
          speed : formData.speed,
          speedDispense : formData.speedDispense,
          mode : formData.mode,
          paintMultiplier : formData.paintMultiplier,
          redBoost : formData.redBoost,
          greenBoost : formData.greenBoost,
          blueBoost : formData.blueBoost,
          whiteBoost : formData.whiteBoost,
          blackBoost : formData.blackBoost
        };

        var errors = 0;
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            if((!data[key] || data[key] == 0 || data[key] === '')) {
              if( $('[config-for="' + target +'"] input[name="' + key + '"]').is(':enabled'))  {
                errors++;
                $('[config-for="' + target +'"] label[for="' + key + '"]').parent('.form-group').addClass('has-error');
              }
            } else {
              $('[config-for="' + target +'"] label[for="' + key + '"]').parent('.form-group').removeClass('has-error');
            }
          }
        }
        if( errors > 0 ) {
          return false;
        } else {
          return data;
        }
      }

      $('.save').click( function (e) {
        e.preventDefault();
        var target = $(this).attr('config-for');

        var data = validateForm( target);

        console.log(data);

        if(data) {
          var button = $(this);
          button.addClass("btn-warning");
          button.html('Saving ...');

              $.ajax({
                contentType: "application/json",
                url: '/private/works',
                type: 'PUT',
                processData: false,
                data: JSON.stringify(data),
                success: function(data) {
                  button.removeClass("btn-warning");
                  button.html('Save');
                  console.log(data);
                }
              });
          }
      });



      $('#addJob').click(function() {
        var data = {
          action: 'add'
        }

        $.ajax({
          contentType: "application/json",
          url: '/private/works/',
          type: 'PUT',
          processData: false,
          data: JSON.stringify(data),
          success: function(data) {
            //console.log(data);
            location.reload();
          }
        });

        return false;

      });


      $('.wc-play').click(function() {
        var data = {
          action: 'play',
          id: $(this).attr('data-id')
        }

        var check = validateForm(data.id);

        if(check) {
          $.ajax({
            contentType: "application/json",
            url: '/private/works',
            type: 'PUT',
            processData: false,
            data: JSON.stringify(check),
            success: function(check) {
              console.log(check);
              $.ajax({
                contentType: "application/json",
                url: '/private/works/',
                type: 'PUT',
                processData: false,
                data: JSON.stringify(data),
                success: function(data) {
                  console.log("play",data);
                  location.reload();
                }
              });


            }
          });



        }
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
            //console.log(data);
          }
        });

        location.reload();
        return false;

      });


      //Inline editor for painting titles. Autoupdates title when you unfocus the editor.
      tinymce.init({
            selector: '.title-edit',
            inline: true,
            setup: function(editor) {
              editor.on('blur', function(e) {
                var edId = this.id;
                var workId = $('#' + this.id).attr('title-for');

                var data = {
                  action: 'update',
                  id : workId,
                  title : tinyMCE.editors[edId].getContent()
                }
                console.log(data);

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

                tinyMCE.execCommand('mceToggleEditor', false, edId);
                tinyMCE.execCommand('mceToggleEditor', false, edId);
                return false;
              });


            }
          });
});
