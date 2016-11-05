//still doesnt work.
console.log("changeimage loaded");

function changeImage() {
    var frameImg = document.getElementById('Painting');
    //why are you null?
    
    //returns HTMLImageElement
    var newImg = this;

    frameImg.src = newImg.firstElementChild.src;
    //why are you undefined?
 
};