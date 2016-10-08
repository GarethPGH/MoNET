document.addEventListener("DOMContentLoaded", function () {
//set the source of the target to the dynamically added image in the thumbnails.
    console.log("gallerypreview.js loaded");
 
    var hrefs = document.getElementsByClassName("thumbnails");
    console.log(hrefs.length);
    var imgs = ['attractivearrow.png', 'attractivearrowr.png', 'bird.png', 'birdwithhat.png', 'birdwithmonocle.png', 'gallerytitle.png', 'gallerytitlebanner.png', 'hero_logo_headsmall.png', 'hero_logo_words.png', 'labels.png', 'sillyraccoon.png', 'yellowfrog.png', 'attractivearrow2.png', 'attractivearrowr2.png', 'bird2.png', 'birdwithhat2.png', 'birdwithmonocle2.png', 'gallerytitle2.png', 'gallerytitlebanner2.png', 'hero_logo_headsmall2.png', 'hero_logo_words2.png', 'labels2.png', 'sillyraccoon2.png', 'yellowfrog2.png'];

    //Proof of concept works. This prints as expected. Now I just need to target the frame on the page.
    for (var i = 0; i < hrefs.length; i++){
        var linkie = hrefs.item(i);
            linkie.setAttribute("src", "~public/images/" +imgs[i]);
            console.log(hrefs[i]);
           
          
    }
});