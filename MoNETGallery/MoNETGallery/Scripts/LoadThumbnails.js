//this kind of worked but....
//REWRITE ME TO SET HREF TO TARGET THE IMAGE THAT IS LOADED INTO EACH THUMBNAIL
//var clicked = document.getElementsByClassName("thumbnails");
//console.log(clicked + "clicked");
//function changeimage(){
//    for (var i = 0; i < clicked.length; i++) {
//        //clicked[i].addEventListener("click", function (event) {
//        //    console.log(clicked[i]+ "thumbnail");
        
//        var image = clicked[i].innerHTML;
//        //somehow this is causing all images to be inserted into the div.

//        //Also image url path are being read as localhost/<image> not localhost/Images/image for whatever reason
//        console.log(clicked[i] + " this");
//        console.log(image + " this image");
//        ///Image is also undefined
//        //tried queryselectorall HTMLCollection clicked[i] various renditions of
//        //thought I found out the answer, transfering into an array and then using forloop is not working
//        console.log(image + "thisisimage");
//        var paintSource = document.getElementById("Painting");
//        console.log(paintSource.src);
//        paintSource.src = image;
//        console.log(paintSource.src);
//    };
//};
//clicked[i].dispatchEvent(event);

document.addEventListener("DOMContentLoaded", function (event) {
    //load dummy icons into thumbnails Make thumbnails viewable in painting

    images = ['attractivearrow.png', 'attractivearrowr.png', 'bird.png', 'birdwithhat.png', 'birdwithmonocle.png', 'gallerytitle.png', 'gallerytitlebanner.png', 'hero_logo_headsmall.png', 'hero_logo_words.png', 'labels.png', 'sillyraccoon.png', 'yellowfrog.png', 'attractivearrow2.png', 'attractivearrowr2.png', 'bird2.png', 'birdwithhat2.png', 'birdwithmonocle2.png', 'gallerytitle2.png', 'gallerytitlebanner2.png', 'hero_logo_headsmall2.png', 'hero_logo_words2.png', 'labels2.png', 'sillyraccoon2.png', 'yellowfrog2.png'];




    for (var i = 13; i <= images.length; i++) {
        var ele = document.createElement('div');
        var element = document.getElementById("thumbalign");
        ele.setAttribute("class", "thumbnails");
        element.appendChild(ele);
    };

    //thumbnails = document.querySelectorAll('.thumbnails');
    ////console.log(thumbnails[15]);
    ////console.log("images " + images.length + "thumbnails " + thumbnails.length);

    //if (thumbnails.length === images.length) {
    //    for (var i = 0; i < thumbnails.length;) {
    //        for (var j = 0; j < images.length;) {
    //            {
                   
    //                if (thumbnails[i].hasChildNodes && thumbnails[i].firstChild.hasOwnProperty("src")) {
    //                    var imgSource = thumbnails[i].firstChild.src;//this does not work, causes infinite looping. Or at least causes a condition always evaluation to 2 or 1
    //                    thumbnails[i].imgSource = images[j];
    //                    i++; j++;
    //                }
    //                //the problem may be here. How do I set innerhtml to the image I want it to be, but have the routing select the image from the array based on its url location?
    //            }

    //        };
    //    };
    //    //console.log(thumbnails.length);
    //}

    ////for thumbalign, only show the first 12

    //var button = document.getElementById("Next");

    //button.addEventListener("click", function (event) {
    //    //This code does not do as intended. Replace it.
    //    alert("ahhh");

    //    //for (i; i < i+12 ; i++) {
    //    //    var item = thumbs[i];
    //    //    item.style.display = "visible";
    //    //}
    //    //move the #target attribute down the page, show 12 icons 




    //});
    //moving the file to the bottom before the closing body tag did not work. The Dom event is being added, but the elements populated are not
    //registering the images as their source despite the image obviously showing in the thumb view.
    //should I rewrite this as separate function and add it as an onclick to the thumbnail post? Should this be in a separate file or function?


    //load thumbnails dynamically from a DB of images from MoNET bot.
    //if thumbs >12 initialize new page of twelve thumbnails
    //activate next/prev arrows
    //check if page=1, set prev to hidden
    //check if page = thumbs.size, set next to hidden
});