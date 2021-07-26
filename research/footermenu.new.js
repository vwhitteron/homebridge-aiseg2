function getElementsByClass(e) {
    var t = []
      , n = document.getElementsByTagName("a");
    for (i = 0; i < n.length; i++)
        n[i].className == e && t.push(n[i]);
    return t
}
function hideFocusObjects(e) {
    for (i = 0; i < e.length; i++)
        e[i].style.visibility = "hidden"
}
function showFocusObjects(e) {
    for (i = 0; i < e.length; i++)
        e[i].style.visibility = "visible"
}
function setFooterMenu() {
    var e, t, n = ["touchstart", "mousedown"], i = ["touchend", "mouseout", "mouseup"], o = document.getElementById("back_button");
    if (o && "pop" == o.name || (document.getElementById("fmenu") && (document.getElementById("fmenu").style.visibility = "hidden"),
    document.getElementById("hitLayer") && (document.getElementById("hitLayer").style.visibility = "hidden")),
    o) {
        for (e = 0; e < n.length; e++)
            o.addEventListener(n[e], function() {
                this.parentNode.style.backgroundPosition = "0 -32px"
            });
        for (o.addEventListener("click", function(e) {
            var t = this.getAttribute("href")
              , n = null
              , i = null;
            if (t.indexOf("/page/graph/582") > -1 || t.indexOf("/page/graph/583") > -1)
                n = JSON.stringify({
                    day: tabs.day,
                    week: tabs.week,
                    month: tabs.month,
                    year: tabs.year,
                    back_url: back_url,
                    term: tabs.term,
                    termStr: tabs.termStr,
                    circuitid: tabs.circuitid,
                    id: tabs.id
                }),
                i = base64encode(n),
                sendRequest(t, "get", {
                    data: i
                });
            else if (t.indexOf("/page/graph/5") > -1)
                n = JSON.stringify({
                    day: tabs.day,
                    week: tabs.week,
                    month: tabs.month,
                    year: tabs.year,
                    back_url: back_url
                }),
                i = base64encode(n),
                sendRequest(t, "get", {
                    data: i
                });
            else if ("/page/setting/initial/711" === t) {
                var o, s, a, l = window.location.href, r = {};
                l.indexOf("71112") > -1 ? (o = q(".input_cost"),
                o.length() > 0 && (r.cost = [o.eq(0).val(), o.eq(1).val() ? o.eq(1).val() : "0"]),
                s = q(".input_price"),
                s.length() > 0 && (r.price = [s.eq(0).val(), s.eq(1).val() ? s.eq(1).val() : "0"]),
                r.weekend = Radiobutton.getValue("weekend"),
                r.token = q("#token").attribute("token"),
                sendAjaxPostRequest("/action/setting/initial/71112/save", r, function(e) {
                    4 === e.readyState && sendAjaxPostRequest("/action/setting/initial/71112/modify_check", r, function(e) {
                        4 === e.readyState && (a = JSON.parse(e.responseText),
                        a.modify ? showPopupWithSize("modify_check", "p_681x368") : location.href = t)
                    })
                })) : l.indexOf("71113") > -1 ? (o = q(".input_cost"),
                o.length() > 0 && (r.cost = [o.eq(0).val(), o.eq(1).val() ? o.eq(1).val() : "0"]),
                s = q(".input_price"),
                s.length() > 0 && (r.price = [s.eq(0).val(), s.eq(1).val() ? s.eq(1).val() : "0"]),
                r.costplan = Radiobutton.getValue("costplan"),
                r.weekend = Radiobutton.getValue("weekend"),
                r.token = q("#main").attribute("token"),
                sendAjaxPostRequest("/action/setting/initial/71113/save", r, function(e) {
                    4 == e.readyState && sendAjaxPostRequest("/action/setting/initial/71113/modify_check", r, function(e) {
                        4 == e.readyState && (a = JSON.parse(e.responseText),
                        a.modify ? showPopupWithSize("modify_check", "p_681x368") : location.href = t)
                    })
                })) : location.href = t
            } else
                this.className.indexOf("disable") < 0 && (location.href = t);
            e.preventDefault()
        }),
        e = 0; e < i.length; e++)
            o.addEventListener(i[e], function() {
                this.parentNode.style.backgroundPosition = "0 0"
            })
    }
    var s = document.getElementById("menu_button");
    if (s)
        for (s.addEventListener("click", SlideController.slide),
        e = 0; e < i.length; e++)
            s.addEventListener(i[e], function() {
                this.parentNode.style.backgroundPosition = "0 0"
            });
    document.getElementById("hitLayer").addEventListener("click", function() {
        this.style.visibility = "hidden",
        SlideController.slide()
    });
    var a = getElementsByClass("fmhit")
      , l = function(e) {
        var t = this.getAttribute("href");
        location.href = t,
        e.preventDefault()
    };
    for (t = 0; t < a.length; t++) {
        var r = a[t];
        for (e = 0; e < n.length; e++)
            r.addEventListener(n[e], function() {
                this.parentNode.style.backgroundPosition = "0 -76px"
            });
        for (r.addEventListener("click", l),
        e = 0; e < i.length; e++)
            r.addEventListener(i[e], function() {
                this.parentNode.style.backgroundPosition = "0 0"
            })
    }
    var d = getElementsByClass("hit")
      , c = function(e) {
        var t = this.getAttribute("href");
        t.match(/^javascript:void\(0\)/) || setTimeout(function() {
            location.href = t
        }, 0),
        1 === SlideController.mode && SlideController.slide("force_off"),
        e.preventDefault()
    };
    for (Array.prototype.push.apply(d, getElementsByClass("hdnhit")),
    t = 0; t < d.length; t++) {
        var u = d[t];
        for (e = 0; e < n.length; e++)
            u.addEventListener(n[e], function() {
                var e = this.parentNode.clientHeight;
                this.parentNode.style.backgroundPosition = "0 " + -e + "px"
            });
        for (u.addEventListener("click", c),
        e = 0; e < i.length; e++)
            u.addEventListener(i[e], function() {
                this.parentNode.style.backgroundPosition = "0 0"
            })
    }
}
var SlideController = {
    init: function() {
        var e = SlideController;
        e.isNetFront = navigator.userAgent.indexOf("NetFront") > 0,
        e.mode = 0,
        e.elements = {
            fm: document.getElementById("fmenu"),
            hhit: getElementsByClass("hdnhit"),
            htab: getElementsByClass("hdntab"),
            hradio: getElementsByClass("radio_off_hdnhit"),
            hl: document.getElementById("hitLayer")
        },
        e.pos = {
            up: 330,
            down: 430
        },
        e.listenEvents = ["webkitTransitionEnd", "mozTransitionEnd", "transitionend"],
        e.transitionParam = "top 0.4s ease-out",
        e.endAnim = function() {
            0 === e.mode ? (e.elements.fm.style.visibility = "hidden",
            e.elements.hl.style.visibility = "hidden",
            showFocusObjects(e.elements.hhit),
            showFocusObjects(e.elements.htab),
            showFocusObjects(e.elements.hradio)) : e.elements.hl.style.visibility = "visible"
        }
        ,
        e.slide = function(t) {
            var n = e.pos.down
              , i = e.pos.up;
            if (0 === e.mode ? (hideFocusObjects(e.elements.hhit),
            hideFocusObjects(e.elements.htab),
            hideFocusObjects(e.elements.hradio),
            e.mode = 1,
            e.elements.fm.style.visibility = "visible") : (n = e.pos.up,
            i = e.pos.down,
            e.mode = 0),
            e.isNetFront || "force_off" == t)
                e.elements.fm.style.top = i + "px",
                e.endAnim();
            else {
                var o = e.elements.fm.style;
                o.top = i + "px",
                o.WebkitTransition = e.transitionParam,
                o.MozTransition = e.transitionParam,
                o.transition = e.transitionParam
            }
        }
        ;
        for (var t = 0; t < e.listenEvents.length; t++)
            e.elements.fm.addEventListener(e.listenEvents[t], e.endAnim);
        setFooterMenu("footer_menu");
        var n = document.getElementById("footer_telop");
        n && (n.onmousedown = function() {
            this.style.backgroundPosition = "0px -36px"
        }
        ,
        n.onmouseout = function() {
            this.style.backgroundPosition = "0px 0px"
        }
        ,
        n.onmouseup = function() {
            this.style.backgroundPosition = "0px 0px"
        }
        ,
        n.onclick = function() {
            location.href = telop_url
        }
        ,
        setTimeout(function() {
            e.startTelop(n.children[0].children[0])
        }, 1e3))
    },
    startTelop: function(e) {
        if (e) {
            var t = 0
              , n = 0
              , i = 45
              , o = 1;
            navigator.userAgent.match(/NetFront/) && (i = 6,
            o = 8);
            var s = document.getElementById("strlen_ruler").offsetWidth + 240 + i * o;
            setInterval(function() {
                t -= o,
                e.style.marginLeft = t + "px",
                o * n++ > s && (n = 0,
                t = 0)
            }, 1e3 / i)
        }
    }
};
document.addEventListener("DOMContentLoaded", function() {
    SlideController.init()
});
