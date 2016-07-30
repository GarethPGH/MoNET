//load dummy icons into thumbnails Make thumbnails viewable in painting

document.addEventListener("DOMContentLoaded", function (event) {

console.log('Hellow there');

var thumbs = document.getElementsByClassName("thumbnails");

    for (var i = 0; i < thumbs.length; i++) {
        thumbs[i].innerHTML = "<img src = 'Images/birdwithmonocle.png', height = '100', width = '75' >";
       
    }
    for (var i = 0; i < thumbs.length; i++) {
        thumbs[i].innerHTML = "<img src = 'Images/birdwithhat.png', height = '100', width = '75' >";
        i=i + 1;
    }
    for (var i = 0; i < thumbs.length; i++) {
        thumbs[i].innerHTML = "<img src = 'Images/bird.png', height = '100', width = '75' >";
        i = i + 2;
    }
   
});

var clicked = document.getElementsByClassName("thumbnails");

clicked.addEventListener("click", function (event) {

    var paintSource = document.getElementById("Painting");
    paintSource.src = clicked.innerHTML();
});

//load thumbnails dynamically from a DB of images from MoNET bot.
//if thumbs >12 initialize new page of twelve thumbnails
//activate next/prev arrows
//check if page=1, set prev to hidden
//check if page = thumbs.size, set next to hidden
