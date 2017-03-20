$(document).ready( function(){
    //Get the canvas 
    var canvas = $('#Painting');
    var container = $(canvas).parent();

    //Run function when browser resizes
    $(window).resize( respondCanvas );

    function respondCanvas() {
        var screenWidth = window.screen.availWidth;
        canvas.attr('width', (screenWidth/100 * 80)); 

        var screenHeight = window.screen.availHeight;
        canvas.attr('height', (screenHeight/100 *75));
         

        
    }
  
    //Initial call 
    respondCanvas();

}); 