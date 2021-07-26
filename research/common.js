function setCommonEvents() {
    q(".radio").click(function(e) {
        hasClass(e.currentTarget, "disable") || Radiobutton.toggle(e.currentTarget)
    }),
    q(".check_box").click(function(e) {
        hasClass(e.currentTarget, "disable") || Checkbox.toggle(e.currentTarget)
    }),
    Radiobutton.addNoSound(),
    setTimeout(Radiobutton.addNoSound, 100)
}
function hasClass(e, t) {
    return -1 !== (" " + e.className + " ").replace(/[\n\t]/g, " ").indexOf(" " + t + " ")
}
function toggleClassByBool(e, t, n) {
    if (e && t) {
        var o = e.className
          , r = new RegExp("^" + t + "$|^" + t + "\\s+|\\s+" + t + "\\s+|\\s+" + t + "$","g");
        if (r.test(o)) {
            if (!n) {
                var s = new RegExp("^" + t + "$|^" + t + "\\s+|\\s+" + t + "$","g")
                  , i = new RegExp("\\s+" + t + "\\s+","g");
                o = o.replace(i, " "),
                o = o.replace(s, ""),
                t === checkedRadioClass && (o = o.replace(/^no_sound$|^no_sound\s+|\s+no_sound$/g, ""),
                o = o.replace(/\s+no_sound\s+/g, " "))
            }
        } else
            n && (t !== checkedRadioClass || /^no_sound$|^no_sound\s+|\s+no_sound\s+|\s+no_sound$/g.test(o) || (o += " no_sound"),
            o = o + " " + t);
        e.className = o
    }
}
function toggleClass(e, t) {
    if (e && t) {
        var n = e.className
          , o = n.indexOf(t);
        n = -1 === o ? n + " " + t : n.substr(0, o) + n.substr(o + t.length),
        n = n.replace("  ", " "),
        e.className = n
    }
}
function sendRequest(e, t, n) {
    var o = document.createElement("form");
    document.body.appendChild(o),
    n || (n = {}),
    n.request_by_form = "1";
    for (var r in n) {
        var s = document.createElement("input");
        s.setAttribute("type", "hidden"),
        s.setAttribute("name", r),
        s.setAttribute("value", n[r]),
        o.appendChild(s)
    }
    o.setAttribute("action", e),
    o.setAttribute("method", t),
    o.submit(),
    ClickLockManager.unlock(),
    ClickLockManager.lock(2e3)
}
function sendAjaxPostRequest(e, t, n, o) {
    var r = new XMLHttpRequest;
    r.onreadystatechange = function() {
        if (4 != this.readyState)
            return void n(r);
        if (!(0 !== this.status || o && o.noerr))
            return void setTimeout(function() {
                q("body").css("backgroundColor", "#000099").text('<font color="#FFFFFF"><h1>通信が切断されました</h1></font>')
            }, 5e3);
        if (200 === this.status)
            try {
                var e = JSON.parse(this.responseText);
                if (e.conflict && e.redirectURL && parseInt(e.conflict) > 0)
                    return void (location.href = e.redirectURL)
            } catch (t) {}
        n(r)
    }
    ,
    r.open("POST", e, !(o && o.sync)),
    r.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"),
    r.setRequestHeader("X-Requested-With", "XMLHttpRequest"),
    r.send("data=" + JSON.stringify(t))
}
function getQueryParams() {
    for (var e = {}, t = location.search.substring(1).split("&"), n = 0; t[n]; n++) {
        var o = t[n].split("=");
        e[o[0]] = o[1]
    }
    return e
}
function showPopup(e, t) {
    ClickLockManager.unlock(),
    q("#popup_base").children().each(function(e) {
        e.css("display", "none")
    });
    for (var n in popupKeys)
        "success" !== n && q("." + n + "_contents").css("display", "none");
    return e ? void setTimeout(function() {
        var e = popupKeys[t];
        e && "success" !== e ? q("." + e + "_contents").css("display", "") : q("." + t + "_contents").css("display", ""),
        q("#popup").css("visibility", "visible")
    }, 0) : void q("#popup").css("visibility", "hidden")
}
function q(e) {
    return new F(findElement(document, e))
}
function findElement(e, t) {
    if (e && !isCollection(e) && t) {
        var n = null;
        return n = t == window || t == document || t == document.body || t instanceof HTMLElement || isCollection(t) ? t : 0 === t.indexOf("#") ? e.getElementById(t.replace("#", "")) : 0 === t.indexOf(".") ? e.getElementsByClassName(t.replace(".", "")) : 0 === t.indexOf("*") ? e.getElementsByName(t.replace("*", "")) : e.getElementsByTagName(t),
        n ? n : void 0
    }
}
function isCollection(e) {
    return "[object HTMLCollection]" === Object.prototype.toString.call(e) || "[object NodeList]" === Object.prototype.toString.call(e) || e instanceof Array
}
function getObjectKeys(e) {
    if (Object.keys)
        return Object.keys(e);
    var t = [];
    for (var n in e)
        e.hasOwnProperty(n) && t.push(n);
    return t
}
function F(e) {
    this.element = e
}
window.alert = function() {}
,
window._originalParseInt = window.parseInt,
window.parseInt = function(e, t) {
    return t || "string" != typeof e || 0 !== e.search(/^0\d+/) ? window._originalParseInt(e, t) : window._originalParseInt(e, 10)
}
;
var popupKeys = {
    running: "running",
    success: "success",
    confirm: "confirm",
    confirm2: "confirm2",
    confirm3: "confirm3",
    error: "error",
    error2: "error2",
    error3: "error3",
    error4: "error4",
    error5: "error5",
    error6: "error6",
    error7: "error7",
    error8: "error8",
    error9: "error9"
}
  , checkedRadioClass = "radio_on"
  , checkedBoxClass = "checked"
  , SessionManager = {
    init: function() {
        var e = SessionManager;
        e.opened = !0,
        window.addEventListener("beforeunload", e.close),
        e.notifyAlive(),
        setInterval(e.notifyAlive, 5e3)
    },
    close: function(e) {
        var t = SessionManager;
        if (t.opened) {
            try {
                "A" == e.currentTarget.document.activeElement.tagName || navigator.userAgent.match(/HomeCTRL/) || sendAjaxPostRequest("/action/close_session", {}, function(e) {}, {
                    sync: !0,
                    noerr: !0
                })
            } catch (n) {}
            t.opened = !1
        }
    },
    notifyAlive: function() {
        sendAjaxPostRequest("/action/keep_session", {}, function(e) {
            if (4 == e.readyState && 200 == e.status) {
                var t = JSON.parse(e.responseText);
                if (!t.demomode)
                    return;
                var n = "/action/demomode/change_state?state=";
                -1 !== location.href.search(/\/page\/common\/03$/) ? "normal" === t.demomode ? location.href = n + "normal" : "manual" === t.demomode && SessionManager.setManualMode(n + "normal") : "blackout" === t.demomode ? location.href = n + "blackout" : "manual" === t.demomode && SessionManager.setManualMode(n + "blackout")
            }
        }, {
            noerr: !0
        })
    },
    setManualMode: function(e) {
        var t = document.getElementById("footer_mode");
        if (t && !hasClass(t, "manual_change")) {
            var n = document.createElement("a");
            n.href = e,
            t.appendChild(n),
            toggleClassByBool(n, "hit", !0),
            toggleClassByBool(t, "manual_change", !0)
        }
    }
}
  , ClickLockManager = {
    locked: !1,
    timer: null,
    lock: function(e) {
        ClickLockManager.locked = !0,
        ClickLockManager.timer = setTimeout(ClickLockManager.unlock, e)
    },
    unlock: function() {
        ClickLockManager.locked = !1,
        clearTimeout(ClickLockManager.timer),
        ClickLockManager.timer = null
    }
};
document.addEventListener("DOMContentLoaded", function() {
    setCommonEvents(),
    "/page/common/011" != document.location.pathname && SessionManager.init(),
    q(".button").mousedown(function() {
        var e = this.clientHeight;
        this.style.backgroundPosition = "0 " + -e + "px"
    }).mouseleave(function() {
        this.style.backgroundPosition = "0 0"
    }).mouseup(function() {
        this.style.backgroundPosition = "0 0"
    }),
    q(".footer_button").mousedown(function() {
        q(this).addClass("footer_button_active")
    }).mouseleave(function() {
        q(this).removeClass("footer_button_active")
    }).mouseup(function() {
        q(this).removeClass("footer_button_active")
    }),
    q("#footer_back").mousedown(function() {
        q(this).addClass("footer_back_active")
    }).mouseleave(function() {
        q(this).removeClass("footer_back_active")
    }).mouseup(function() {
        q(this).removeClass("footer_back_active")
    }),
    q(".radio").click(function() {
        return setTimeout(Radiobutton.addNoSound, 100),
        !1
    }).mousedown(function() {
        if (!q(this).hasClass(checkedRadioClass)) {
            var e = this.clientHeight;
            this.style.backgroundPosition = "0 " + -e + "px"
        }
    }).mouseleave(function() {
        q(this).hasClass(checkedRadioClass) || (this.style.backgroundPosition = "0 0")
    }).mouseup(function() {
        q(this).hasClass(checkedRadioClass) || (this.style.backgroundPosition = "0 0")
    }),
    document.addEventListener("dragstart", function(e) {
        return e.preventDefault(),
        !1
    }),
    document.addEventListener("click", function(e) {
        if ("menu_button" !== e.target.id) {
            if (ClickLockManager.locked)
                return e.stopPropagation(),
                e.preventDefault(),
                !1;
            if (e.target.href && (0 === e.target.href.indexOf("http://") || 0 === e.target.href.indexOf("javascript:preventionMultiPress")))
                return void ClickLockManager.lock(2e3);
            ClickLockManager.lock(200),
            sendAjaxPostRequest("/action/judge_conflict", {
                reqURL: document.location.pathname
            }, function(e) {
                if (4 == e.readyState && 200 == e.status) {
                    var t = JSON.parse(e.responseText);
                    "0" != t.result && (location.href = t.redirectURL)
                }
            }, {
                noerr: !0
            })
        }
    }, !0),
    document.addEventListener("mousedown", function(e) {
        return "menu_button" !== e.target.id && ClickLockManager.locked ? (e.stopPropagation(),
        e.preventDefault(),
        !1) : void 0
    }, !0);
    var e = navigator.userAgent;
    if (e.match(/MSIE|Trident|Edge/))
        for (var t = 0, n = function(e) {
            var n = parseInt(e.target.getAttribute("Pmaxlength"))
              , o = e.target.value;
            "keypress" == e.type && 241 != e.keyCode && 242 != e.keyCode ? t++ : "keyup" == e.type ? (--t < 0 ? 13 == e.keyCode && o.length > n && (e.target.value = o.substring(0, n)) : o.length > n && (e.target.value = o.substring(0, n)),
            t = 0) : "blur" == e.type && (e.target.value = o.substring(0, n))
        }, o = document.getElementsByTagName("input"), r = 0; r < o.length; r++)
            !o[r].getAttribute("maxlength") || o[r].getAttribute("type") && "text" != o[r].getAttribute("type") || (o[r].addEventListener("keypress", n),
            o[r].addEventListener("keyup", n),
            o[r].addEventListener("blur", n),
            o[r].setAttribute("Pmaxlength", o[r].getAttribute("maxlength")),
            o[r].removeAttribute("maxlength"));
    -1 != navigator.userAgent.indexOf("Android") && history && history.pushState && (window.onpopstate = function() {
        location.replace("/page/common/014")
    }
    ,
    history.pushState(null, null, null))
});
var Radiobutton = {
    toggle: function(e) {
        if (!e.getAttribute("nofunc")) {
            var t = e.getAttribute("value")
              , n = e.parentElement.getElementsByClassName("setting_value")[0]
              , o = e.parentElement.getElementsByClassName("radio");
            if (n || (n = e.parentElement.parentElement.getElementsByClassName("setting_value")[0],
            o = e.parentElement.parentElement.getElementsByClassName("radio")),
            !n || n.innerHTML === t)
                return !1;
            t && (n.innerHTML = t);
            for (var r = 0, s = o.length; s > r; r++)
                toggleClassByBool(o[r], checkedRadioClass, !1);
            toggleClassByBool(e, checkedRadioClass, !0)
        }
    },
    getValue: function(e) {
        for (var t = document.getElementsByName(e), n = 0; n < t.length; n++) {
            var o = t[n];
            if (hasClass(o, checkedRadioClass))
                return o.getAttribute("value")
        }
        return null
    },
    addNoSound: function() {
        for (var e = document.getElementsByClassName("radio"), t = 0; t < e.length; t++) {
            var n = e[t];
            hasClass(n, checkedRadioClass) ? toggleClassByBool(n, "no_sound", !0) : toggleClassByBool(n, "no_sound", !1)
        }
    }
}
  , Checkbox = {
    toggle: function(e) {
        toggleClass(e, checkedBoxClass)
    },
    getValues: function(e) {
        for (var t = [], n = document.getElementsByName(e), o = 0; o < n.length; o++) {
            var r = n[o];
            hasClass(r, "checked") && t.push(r.getAttribute("value"))
        }
        return t
    }
}
  , StringFormat = function() {};
StringFormat.format = function(e, t) {
    return "object" != typeof t && (t = Array.prototype.slice.call(arguments, 1)),
    e.replace(/\{(.+?)\}/g, function(e, n) {
        return t[n] ? t[n] : e
    })
}
,
F.prototype.css = function(e, t) {
    if (null === t) {
        if (isCollection(this.element))
            return;
        return this.element.style.getPropertyValue(e)
    }
    return this.each(function(n) {
        n.dom().style[e] = t
    })
}
,
F.prototype.addClass = function(e) {
    return this.each(function(t) {
        toggleClassByBool(t.dom(), e, !0)
    })
}
,
F.prototype.removeClass = function(e) {
    return this.each(function(t) {
        toggleClassByBool(t.dom(), e, !1)
    })
}
,
F.prototype.hasClass = function(e) {
    return hasClass(this.element, e)
}
,
F.prototype.classList = function() {
    var e = this.element.className;
    if (e.length > 0) {
        for (var t = e.replace(/^\s+|\s+$/g, "").replace(/ +/g, " ").split(" "), n = 0; n < t.length; n++)
            t[n] = t[n].toString().trim();
        return t
    }
    return []
}
,
F.prototype.mouseleave = function(e) {
    return this.each(function(t) {
        t.dom().addEventListener("mouseout", e)
    })
}
,
F.prototype.mousedown = function(e) {
    return this.each(function(t) {
        t.dom().addEventListener("mousedown", e),
        t.dom().addEventListener("touchstart", e)
    })
}
,
F.prototype.mouseup = function(e) {
    return this.each(function(t) {
        t.dom().addEventListener("mouseup", e),
        t.dom().addEventListener("touchend", e)
    })
}
,
F.prototype.click = function(e) {
    return this.each(function(t) {
        t.dom().addEventListener("click", e)
    })
}
,
F.prototype.ready = function(e) {
    return this.element.addEventListener("DOMContentLoaded", e),
    new F(this.element)
}
,
F.prototype.load = function(e) {
    return this.element.onload = e,
    new F(this.element)
}
,
F.prototype.get = function(e) {
    return isCollection(this.element) && this.element[e] ? new F(this.element[e]) : void 0
}
,
F.prototype.attribute = function(e, t) {
    return isCollection(this.element) ? void 0 : t ? (this.element.setAttribute(e, t),
    new F(this.element)) : this.element.getAttribute(e)
}
,
F.prototype.find = function(e) {
    return new F(findElement(this.element, e))
}
,
F.prototype.length = function(e) {
    return this.element.length
}
,
F.prototype.each = function(e) {
    if (isCollection(this.element))
        for (var t = 0; t < this.element.length; t++) {
            var n = this.element[t];
            n && e(new F(n), t)
        }
    else
        this.element && e(new F(this.element));
    return new F(this.element)
}
,
F.prototype.parent = function() {
    return isCollection(this.element) ? void 0 : new F(this.element.parentElement)
}
,
F.prototype.children = function() {
    return isCollection(this.element) ? void 0 : new F(this.element.children)
}
,
F.prototype.text = function(e) {
    if (void 0 === e) {
        if (isCollection(this.element))
            return;
        return this.element.innerHTML
    }
    return this.each(function(t) {
        t.dom().innerHTML = e
    })
}
,
F.prototype.val = function(e) {
    if (void 0 === e) {
        if (isCollection(this.element))
            return;
        return this.element.value
    }
    return this.each(function(t) {
        t.dom().value = e
    })
}
,
F.prototype.dom = function() {
    return this.element
}
,
F.prototype.eq = function(e) {
    return new F(this.element[e])
}
;
