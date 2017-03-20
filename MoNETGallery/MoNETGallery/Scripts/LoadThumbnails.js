document.addEventListener("DOMContentLoaded", function () {
    //create a function to load images into the tabs
    var imgs = ["attractivearrow.png", "attractivearrow2.png", "attractivearrowr.png", "attractivearrowr2.png", "bird.png", "bird2.png", "birdwithhat.png", "birdwithmonocle.png", "birdwithmonocle2.png", "gallerytitle.png", "gallerytitle2.png", "gallerytitlebanner.png", "gallerytitlebanner2.png", "hero_logo_headsmall.png", "hero_logo_headsmall2.png", "hero_logo_words.png", "labels.png", "sillyraccoon.png", "sillyraccoon2.png", "yellowfrog.png", "yellowfrog2.png"];

    var thumbs = document.getElementsByClassName("thumbnails");
    console.log(thumbs[2]);
    console.log(thumbs.length);

    for (var i = 0; i <= thumbs.length; i++) {
        if (thumbs[i].children.length > 0) {
            var thingy = thumbs[i].firstElementChild;
                thingy.setAttribute("src", "/public/images/" + imgs[i]);
        };
    //It works, but why is thumbs[i] still undefined?    
        
      
    };
});