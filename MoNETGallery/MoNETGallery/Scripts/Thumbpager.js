window.addEventListener("hashchange", funcRef, false);

//define a function that on hashchange will display next pane of 12 thumbs. or prev pane of 12 thumbs
//check if the 12 thumbs are the 12 on initial pageload. If so disable prev button.
//check if last thumb, disable next button
if (thumbs.isloaded()) {
//show page
};
//Load all thumbnails in the page
//use target html to navigate through in sets of 12.

//for optimization, pull first 12 and second 12, but hold off in async await for anything more than the first 2 pg of 12.
//as each thumb is just the full image shrunk down.