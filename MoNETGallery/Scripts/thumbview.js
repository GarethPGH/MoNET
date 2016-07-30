
var images = document.getElementById("thumbrow").child.getElementsByTagName("img");
for (var i = 0; i < images.length; i++) {
    images[i].onmouseover= function(){
        //change border color, cursor style
        this.style.cursor = "hand";
        this.style.borderColor="blue";
    }
    images[i].onmouseout= function(){
        //change border back, cursor to pointer
        this.style.cursor = "pointer";
        this.style.borderColor = "grey";
    }
}
function changeImage(event) {
    event = event || window.event;
    var targetElement = event.target || event.srcElement;

    if(targetElement.tagName =="IMG"){
        document.getElementById("Painting").src = targetElement.getAttribute("src");
    }
   
};