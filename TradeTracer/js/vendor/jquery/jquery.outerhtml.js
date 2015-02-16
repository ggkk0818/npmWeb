jQuery.fn.outerHTML = function (s) {
    return (s) ? this.before(s).remove() : jQuery("<div></div>").append(this.eq(0).clone()).html();
}