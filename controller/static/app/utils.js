function setActiveMenuItem(name) {
    $("div#menu-main a.item").removeClass("active");
    $("div#menu-main a#"+name).addClass("active");
}
