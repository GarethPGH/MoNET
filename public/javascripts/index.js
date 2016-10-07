$(document).ready(function() {

  // hide .navbar first
  $(".navbar").hide();

  // fade in .navbar
  $(function() {
    $(window).scroll(function() {

      // set distance user needs to scroll before we start fadeIn
      if ($(this).scrollTop() > 10) {
        $('.navbar').fadeIn();
      } else {
        $('.navbar').fadeOut();
      }
    });
  });

  var email = $('#social').html();

  email = email.replace('our_email','<a href="mailto:&#105;&#110;&#102;&#111;&#064;&#112;&#114;&#111;&#106;&#101;&#099;&#116;&#109;&#111;&#046;&#110;&#101;&#116;">&#105;&#110;&#102;&#111;&#064;&#112;&#114;&#111;&#106;&#101;&#099;&#116;&#109;&#111;&#046;&#110;&#101;&#116;</a>');

  $('#social').html(email);


});
