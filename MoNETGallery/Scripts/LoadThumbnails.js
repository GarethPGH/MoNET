"use strict";


var imgs = ["attractivearrow.png", "attractivearrow2.png", "attractivearrowr.png", "attractivearrowr2.png", "bird.png", "bird2.png", "birdwithhat.png", "birdwithmonocle.png", "birdwithmonocle2.png", "gallerytitle.png", "gallerytitle2.png", "gallerytitlebanner.png", "gallerytitlebanner2.png", "hero_logo_headsmall.png", "hero_logo_headsmall2.png", "hero_logo_words.png", "labels.png", "sillyraccoon.png", "sillyraccoon2.png", "yellowfrog.png", "yellowfrog2.png"];

    function loadMyFnThumbnails() {
    
        var thumbs = document.getElementsByClassName("thumbnails");
        for (var i = thumbs.length - 1; i >= 0; --i) {
            thumbs[i].addEventListener("click", changeImage);
        }
       

        for (var index = thumbs.length - 1; index >= 0; --index) {
            

            if (thumbs[index].children.length > 0) {

                var thumbnailImg = thumbs[index];
                thumbnailImg.firstElementChild.setAttribute("src", "/public/images/" + imgs[index]);
                
              
            };
            
        };
      
    };

