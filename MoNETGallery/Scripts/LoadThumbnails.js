
    //create a function to load images into the tabs
    var imgs = ["attractivearrow.png", "attractivearrow2.png", "attractivearrowr.png", "attractivearrowr2.png", "bird.png", "bird2.png", "birdwithhat.png", "birdwithmonocle.png", "birdwithmonocle2.png", "gallerytitle.png", "gallerytitle2.png", "gallerytitlebanner.png", "gallerytitlebanner2.png", "hero_logo_headsmall.png", "hero_logo_headsmall2.png", "hero_logo_words.png", "labels.png", "sillyraccoon.png", "sillyraccoon2.png", "yellowfrog.png", "yellowfrog2.png"];
    function loadMyFnThumbnails() {
        //add another loop to add event listener "click" that will set #Frame to image src.
        var thumbs = document.getElementsByClassName("thumbnails");

        function changeImage(btnImg) {
            var frameImg = document.getElementById('Painting');
            //why are you null?
            console.log("The picture frame" + frameImg);
            //returns HTMLImageElement
            frameImg.src = btnImg.src;
            //why are you undefined?
            console.log("The picture frame" + frameImg);

        };

        //Getting closer but still not there yet

        //create function name for function below and call it properly. It might work better this way.

        for (var index = 0; index <= thumbs.length; index++) {

            thumbs[index].addEventListener("click", changeImage);

            if (thumbs[index].children.length > 0) {
                var thumbnailImg = thumbs[index].firstElementChild;
                thumbnailImg.setAttribute("src", "/public/images/" + imgs[index]);
                console.log(thumbnailImg);
            };
            //It works, but why is thumbs[i] still undefined?    
        };
    };
    window.onload = loadMyFnThumbnails;
