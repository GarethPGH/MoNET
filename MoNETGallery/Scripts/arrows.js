var i = 1;
showPage = function (page) {
    $(".content").hide();
    $(".content").each(function (n) {
        if (n >= pageSize * (page - 1) && n < pageSize * page)
            $(this).show();
    });
}

showPage(i);

$("#previous").click(function () {
    $("#next").removeClass("current");
    $(this).addClass("current");
    if (i != 1) {
        showPage(--i);
    }
});
$("#next").click(function () {
    $("#previous").removeClass("current");
    $(this).addClass("current");
    if (i < ($('.content').length) / 3) {
        showPage(++i);
    }
});