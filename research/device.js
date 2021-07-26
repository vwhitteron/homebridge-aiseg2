function getDevice() {
    var e, r = navigator.userAgent;
    return r.match(/Viera.*Firefox|Firefox.*Viera/) ? e = "tv" : r.match(/HomeCTRL/) ? e = "hc" : r.match(/JM_MON/) ? e = "nf" : r.match(/HM_MON/) ? e = "nf" : r.match(/Android/) ? (e = "sp",
    r.match(/Mobile/) || (drawScreen.tablet = !0)) : r.match(/iPhone|iPad|iPod/) ? (e = "sp",
    drawScreen.iOS = !0,
    r.match(/iPad/) && (drawScreen.tablet = !0),
    r.match(/CriOS|FxiOS/) || (drawScreen.safari = !0)) : e = r.match(/NetFront/) ? "nf" : r.match(/AiSEG/) ? "aiseg" : r.match(/PEWDMSHomeViewer/) ? "aiseg" : "pc",
    e
}
var drawScreen = {
    view_h: 480,
    view_w: 800,
    viewport_w: 800,
    softkeyboard: !1,
    tv: function(e, r) {
        var t = e / drawScreen.view_h
          , n = r / drawScreen.view_w
          , i = t > n ? n : t;
        i = Math.round(1e3 * i) / 1e3;
        var a = document.getElementsByClassName("wrap")[0].style;
        a.webkitTransformOrigin = "50% 0",
        a.MozTransformOrigin = "50% 0",
        a.transformOrigin = "50% 0",
        a.webkitTransform = "scale(" + i + ")",
        a.MozTransform = "scale(" + i + ")",
        a.transform = "scale(" + i + ")"
    },
    sp: function(e, r, t) {
        var n = document.getElementsByClassName("wrap")[0].style;
        if (n.visibility = "visible",
        drawScreen.softkeyboard)
            return n.transform.indexOf("rotate") > -1 && (n.top = 0,
            n.left = 0,
            n.margin = 0,
            drawScreen.iOS && (n.display = "none",
            setTimeout(function() {
                n.display = "block"
            }, 100))),
            n.position = "absolute",
            void (n.transform = "");
        if (n.top = "50%",
        n.left = "50%",
        n.marginTop = "-240px",
        n.marginLeft = "-400px",
        n.position = r < document.body.clientWidth ? "absolute" : "fixed",
        drawScreen.iOS && t) {
            if (drawScreen.safari && r > e) {
                var i = document.createElement("div");
                i.style.backgroundColor = "#3c3c3d",
                i.style.width = i.style.height = "100%",
                i.style.position = "fixed",
                document.body.appendChild(i),
                drawScreen.dummy_div_for_safari = i,
                drawScreen.initialHeight = e
            }
            var a = function() {
                drawScreen.softkeyboard || drawScreen.sp(window.innerHeight, window.innerWidth)
            };
            setTimeout(a, 500),
            setTimeout(a, 1e3)
        } else
            drawScreen.safari && (drawScreen.dummy_div_for_safari && (document.body.removeChild(drawScreen.dummy_div_for_safari),
            delete drawScreen.dummy_div_for_safari),
            drawScreen.initialHeight > e && window.scrollTo(0, (drawScreen.initialHeight - e) / 2));
        var o = e / drawScreen.view_h
          , d = r / drawScreen.view_w
          , c = drawScreen.viewport_w / r;
        if (o > d && e > r) {
            var s = Math.min(e / drawScreen.view_w, r / drawScreen.view_h);
            n.transform = "scale(" + s * c + ") rotate(90deg)"
        } else {
            var w = Math.min(o, d);
            n.transform = "scale(" + w * c + ")"
        }
    }
};
document.addEventListener("DOMContentLoaded", function() {
    var e = getDevice();
    if (document.body.className = e,
    document.body.style.visibility = "visible",
    !drawScreen.tablet) {
        var r = drawScreen[e];
        if (r && (r(window.innerHeight, window.innerWidth, !0),
        window.addEventListener("resize", function() {
            r(window.innerHeight, window.innerWidth),
            drawScreen.iOS && setTimeout(function() {
                r(window.innerHeight, window.innerWidth)
            }, 100)
        }, !0)),
        "sp" === e) {
            var t = /^tel$|^textarea$|^text$|^number$|^password$/;
            document.addEventListener("DOMFocusIn", function(e) {
                !drawScreen.softkeyboard && e.target && e.target.type && e.target.type.match(t) && (drawScreen.softkeyboard = !0,
                r(window.innerHeight, window.innerWidth))
            }, !1),
            document.addEventListener("DOMFocusOut", function(e) {
                drawScreen.softkeyboard && e.target && e.target.type && e.target.type.match(t) && (drawScreen.softkeyboard = !1,
                setTimeout(function() {
                    drawScreen.softkeyboard || r(window.innerHeight, window.innerWidth)
                }, 100))
            }, !1)
        } else
            "aiseg" === e && document.addEventListener("mousedown", function(e) {
                var r = e.target.tagName;
                r && r.match(/^TEXTAREA$|^INPUT$/) && (e.preventDefault(),
                e.target.focus(),
                e.target.setSelectionRange(0, 0))
            })
    }
});
