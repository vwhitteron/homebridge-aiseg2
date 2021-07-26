function setEvents(e, t, a) {
    q(".lighting_switch").click(function(e) {
        q(e.currentTarget).hasClass("disable") || (q(e.currentTarget).addClass("disable"),
        onClickOnOff(e.currentTarget),
        setTimeout(function() {
            q(e.currentTarget).removeClass("disable")
        }, 2e3))
    }),
    q(".lighting_control").click(function(e) {
        q(e.currentTarget).hasClass("disable") || onClickModulate(e.currentTarget)
    }),
    q(".scroll_top").each(function(t) {
        t.hasClass("disable") || t.click(function(t) {
            1 != e && onScrollChange(e, !0, a)
        })
    }),
    q(".scroll_bottom").each(function(n) {
        n.hasClass("disable") || n.click(function(n) {
            e >= t || onScrollChange(e, !1, a)
        })
    }),
    q("#button_update").click(function(e) {
        onCacheUpdate(e.currentTarget)
    }),
    q("#popup_button_cb").click(function() {
        showPopup(!1, "")
    }),
    q("#popup_button_cancel").click(function() {
        showPopup(!1, "")
    }),
    q(".popup_modulate").eq(0).find(".button").each(function(e) {
        q("#" + e.dom(0).id).click(function(e) {
            q(e.currentTarget).hasClass("disable") || (q(e.currentTarget).addClass("disable"),
            setModulate(e.currentTarget))
        })
    })
}
function getNodeElements() {
    var e = [];
    return q(document.body).find(".panel").each(function(t) {
        e.push(t)
    }),
    e
}
function autoUpdate() {
    for (var e = getNodeElements(), t = [], a = 0; a < e.length; a++)
        t.push({
            nodeId: e[a].attribute("nodeId"),
            eoj: e[a].attribute("eoj"),
            type: e[a].attribute("type"),
            nodeIdentNum: e[a].attribute("nodeIdentNum"),
            deviceId: e[a].attribute("deviceId")
        });
    var n = getQueryParams();
    n.list = t,
    sendAjaxPostRequest("/data/devices/device/32i1/auto_update", n, function(e) {
        if (4 === e.readyState)
            if (0 === e.status)
                ;
            else if (200 === e.status || 304 === e.status) {
                var t = JSON.parse(e.responseText);
                updataPanelData(t.panelData)
            }
    })
}
function updataPanelData(e) {
    for (var t = 0; t < e.length; t++) {
        var a = "#panel_" + e[t].id
          , n = q(a).dom();
        n.setAttribute("state", e[t].state),
        n.children[0].className = "icon " + e[t].state,
        n.children[2].className = "lighting_state lo-w63 " + e[t].state,
        n.children[2].innerHTML = e[t].state_label,
        n.children[3].className = "lighting_switch button w74 h46 " + e[t].disable,
        n.children[3].children[0].innerHTML = e[t].index_onoff,
        n.children[4].className = "lighting_control button w142 h46 " + e[t].modulate_hidden,
        n.children[4].children[0].children[0].className = "per_bar lv_" + e[t].modulate_level
    }
}
function onScrollChange(e, t, a) {
    document.location.href = "/page/devices/device/32i1?track=32&page=" + parseInt(a) + "&individual_page=" + (t ? parseInt(e) - 1 : parseInt(e) + 1)
}
function onCacheUpdate() {
    var e = (getNodeElements(),
    document.getElementsByClassName("setting_value")[0].innerHTML);
    sendAjaxPostRequest("/action/devices/device/32i1/update", {
        token: e
    }, function(e) {}),
    q("#button_update").addClass("disable").find(".button_text").text("更新中"),
    setTimeout(function() {
        q("#button_update").removeClass("disable").find(".button_text").text("更新")
    }, 2e4)
}
function onClickOnOff(e) {
    var t = {};
    t.token = document.getElementsByClassName("setting_value")[0].innerHTML,
    t.nodeId = q(e.parentElement).attribute("nodeId"),
    t.eoj = q(e.parentElement).attribute("eoj"),
    t.type = q(e.parentElement).attribute("type");
    var a = "on" === q(e.parentElement).attribute("state") ? "0x31" : "0x30";
    t.device = {
        onoff: a,
        modulate: "-"
    },
    setDevControl(t)
}
function onClickModulate(e) {
    ctrlParam.nodeId = q(e.parentElement).attribute("nodeId"),
    ctrlParam.eoj = q(e.parentElement).attribute("eoj"),
    ctrlParam.type = q(e.parentElement).attribute("type"),
    showPopup(!0, "popup_modulate")
}
function setModulate(e) {
    var t = {};
    t.token = document.getElementsByClassName("setting_value")[0].innerHTML,
    t.nodeId = ctrlParam.nodeId,
    t.eoj = ctrlParam.eoj,
    t.type = ctrlParam.type,
    t.device = {
        onoff: "-",
        modulate: e.getAttribute("modulate")
    },
    setDevControl(t)
}
function setDevControl(e) {
    sendAjaxPostRequest("/action/devices/device/32i1/change", e, function(t) {
        if (4 === t.readyState)
            if (0 === t.status)
                ;
            else if (200 === t.status || 304 === t.status) {
                var a = JSON.parse(t.responseText);
                0 === parseInt(a.result) ? (showPopup(!0, "popup_dev_ctrl"),
                setTimeout(function() {
                    checkStatus(a.acceptId, e.type)
                }, 1e3)) : (showPopup(!0, "popup_dev_ctrl_fail"),
                sendAjaxPostRequest("/action/enable_presskey", {}, function(e) {}))
            }
    })
}
function checkStatus(e, t) {
    var a = {};
    a.acceptId = e,
    a.type = t,
    sendAjaxPostRequest("/data/devices/device/32i1/check", a, function(a) {
        if (4 === a.readyState)
            if (0 === a.status)
                ;
            else if (200 === a.status || 304 === a.status) {
                var n = JSON.parse(a.responseText);
                switch (parseInt(n.result)) {
                case 0:
                    autoUpdate(),
                    showPopup(!1, ""),
                    sendAjaxPostRequest("/action/enable_presskey", {}, function(e) {});
                    break;
                case 1:
                    setTimeout(function() {
                        checkStatus(e, t)
                    }, 1e3);
                    break;
                case 2:
                    showPopup(!1, ""),
                    showPopup(!0, "popup_dev_ctrl_fail"),
                    sendAjaxPostRequest("/action/enable_presskey", {}, function(e) {});
                    break;
                default:
                    showPopup(!1, ""),
                    showPopup(!0, "popup_dev_ctrl_fail"),
                    sendAjaxPostRequest("/action/enable_presskey", {}, function(e) {})
                }
            }
    })
}
function showPopup(e, t) {
    setTimeout(function() {
        if (popupHidden(),
        e) {
            switch (t) {
            case "popup_dev_ctrl":
                q(".popup_dev_ctrl").css("display", "block");
                break;
            case "popup_dev_ctrl_fail":
                q(".popup_dev_ctrl_fail").css("display", "block"),
                q("#popup_button_cb").css("display", "block");
                break;
            case "popup_modulate":
                q(".popup_modulate").css("display", "block"),
                q("#popup_button_cancel").css("display", "block"),
                q("#button_20").removeClass("disable"),
                q("#button_40").removeClass("disable"),
                q("#button_60").removeClass("disable"),
                q("#button_80").removeClass("disable"),
                q("#button_100").removeClass("disable")
            }
            q(".popup_dialog_32i1").css("display", "block")
        }
    }, 100)
}
function popupHidden() {
    q(".popup_dialog_32i1").css("display", "none"),
    q(".popup_dev_ctrl").css("display", "none"),
    q(".popup_dev_ctrl_fail").css("display", "none"),
    q(".popup_modulate").css("display", "none"),
    q("#popup_button_cb").css("display", "none"),
    q("#popup_button_cancel").css("display", "none")
}
var showDeviceCnt = 8
  , initPageCnt = 1
  , updateTimer = setInterval(autoUpdate, 5e3)
  , ctrlParam = {};
document.addEventListener("DOMContentLoaded", function() {
    var e = Math.ceil(deviceCnt / showDeviceCnt)
      , t = getQueryParams()
      , a = !t.page || t.page <= 1 ? 1 : t.page
      , n = !t.individual_page || t.individual_page <= 1 ? 1 : t.individual_page;
    n = n > e ? e : n,
    1 == n && q(".scroll_top").addClass("disable"),
    n >= e && q(".scroll_bottom").addClass("disable");
    var s = q(".scroll_bar");
    if (1 >= e)
        s.css("height", "241px"),
        s.css("top", "54px");
    else {
        var o = Math.ceil((q(".scroll_bar_wrap").eq(0).element.offsetHeight - 10) / e);
        s.css("height", o + "px"),
        s.css("top", 54 + o * (n - 1) + "px")
    }
    setEvents(n, e, a),
    showPopup(!1, "")
});
