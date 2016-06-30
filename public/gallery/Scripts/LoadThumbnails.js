document.onload(){} 
//while there are images that exist
//when three thumbails filled, add new thumbnail divs

this == document.getElementById("thumbnails")
//if thumbnails total = 12 or thumbanail rows = 4, then add new page
if(/*thumbnails is empty*/ this.innerHTML == ""){
    this.addClass("hidden");
    //set inner html.css to hidden
}
//create a pagination
};