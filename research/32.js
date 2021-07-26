function init(e, n, t, a, i) {
    if (arrayDevList = i,
    numPageTotal = Math.ceil(e / NUM_OF_DEVICE_PER_PAGE),
    0 === numPageTotal && (numPageTotal = 1),
    numPageNo = n,
    numOldPageNo = t,
    numPageNo > numPageTotal)
        return void (location.href = "/page/devices/device/32");
    var c = document.getElementsByClassName("scroll_bar")[0].style;
    c.height = Math.floor(BAR_MAX_SIZE / numPageTotal) + "px",
    view(),
    q("#popup").addClass("popup_dialog_popup"),
    setEvents(),
    c.visibility = "visible",
    setTimeout(function() {
        autoUpdate(a, numPageNo, numOldPageNo)
    }, 5e3)
}
function view() {
    var e = document.getElementsByClassName("scroll_top")[0]
      , n = document.getElementsByClassName("scroll_bottom")[0];
    numPageNo > 1 ? toggleClassByBoolSP(e, "disable", !1) : toggleClassByBoolSP(e, "disable", !0),
    numPageTotal > numPageNo ? toggleClassByBoolSP(n, "disable", !1) : toggleClassByBoolSP(n, "disable", !0);
    var t = document.getElementsByClassName("scroll_bar")[0].style;
    t.marginTop = Math.floor(BAR_MAX_SIZE / numPageTotal * (numPageNo - 1)) + "px"
}
function setEvents() {
    q("#action_ev_warning").find(".popup_button_yes").click(function() {
        evOpeModeCtrl("stop")
    }),
    q("#action_ev_warning").find(".popup_button_no").click(function() {
        setTimeout(function() {
            showPopup(!1, "popup")
        }, 100)
    }),
    q("#action_ev_restart").find(".popup_button_yes").click(function() {
        evScheduleRestart()
    }),
    q("#action_ev_restart").find(".popup_button_no").click(function() {
        setTimeout(function() {
            showPopup(!1, "restart")
        }, 100)
    })
}
function onClickScroll(e) {
    switch (e) {
    case "up":
        numPageNo > 1 && (numOldPageNo = numPageNo,
        numPageNo--);
        break;
    case "down":
        numPageTotal > numPageNo && (numOldPageNo = numPageNo,
        numPageNo++)
    }
    onScrollButton()
}
function onScrollButton() {
    var e = "/page/devices/device/32"
      , n = {};
    n.page = numPageNo,
    n.old_page = numOldPageNo,
    sendRequest(e, "get", n)
}
function onEcocuteHeat(e, n, t, a, i) {
    var c = "/action/devices/device/301"
      , l = {};
    l.page = numPageNo,
    l.old_page = numOldPageNo,
    l.nodeid = e,
    l.eoj = n,
    l.devtype = t,
    l.heatcmd = a,
    l.bathcmd = "-",
    l.token = i,
    sendRequest(c, "get", l)
}
function onEcocuteBath(e, n, t, a, i) {
    var c = "/action/devices/device/301"
      , l = {};
    l.page = numPageNo,
    l.old_page = numOldPageNo,
    l.nodeid = e,
    l.eoj = n,
    l.devtype = t,
    l.heatcmd = "-",
    l.bathcmd = a,
    l.token = i,
    sendRequest(c, "get", l)
}
function onIpHp_1(e, n, t, a) {
    var i = "/action/devices/device/301"
      , c = {};
    c.page = numPageNo,
    c.old_page = numOldPageNo,
    c.nodeid = e,
    c.eoj = n,
    c.devtype = t,
    c.heatcmd = "0x41",
    c.bathcmd = "-",
    c.token = a,
    sendRequest(i, "get", c)
}
function onIpHp_2(e, n, t, a) {
    var i = "/action/devices/device/301"
      , c = {};
    c.page = numPageNo,
    c.old_page = numOldPageNo,
    c.nodeid = e,
    c.eoj = n,
    c.devtype = t,
    c.heatcmd = "0x42",
    c.bathcmd = "-",
    c.token = a,
    sendRequest(i, "get", c)
}
function onIpHp_3(e, n, t, a) {
    var i = "/action/devices/device/301"
      , c = {};
    c.page = numPageNo,
    c.old_page = numOldPageNo,
    c.nodeid = e,
    c.eoj = n,
    c.devtype = t,
    c.heatcmd = "0x43",
    c.bathcmd = "-",
    c.token = a,
    sendRequest(i, "get", c)
}
function onEnefarmHeat(e, n, t, a, i) {
    var c = "/action/devices/device/301"
      , l = {};
    l.page = numPageNo,
    l.old_page = numOldPageNo,
    l.nodeid = e,
    l.eoj = n,
    l.devtype = t,
    l.bathcmd = a,
    l.generatecmd = "-",
    l.token = i,
    sendRequest(c, "get", l)
}
function onEnefarmGenerate(e, n, t, a, i) {
    var c = "/action/devices/device/301"
      , l = {};
    l.page = numPageNo,
    l.old_page = numOldPageNo,
    l.nodeid = e,
    l.eoj = n,
    l.devtype = t,
    l.bathcmd = "-",
    l.generatecmd = a,
    l.token = i,
    sendRequest(c, "get", l)
}
function onAirconAllStop(e) {
    var n = "/action/devices/device/303"
      , t = {}
      , a = 0
      , i = !1
      , c = !1;
    for (a = 0; a < arrayDevList.length; a++)
        3 === parseInt(arrayDevList[a].type, 16) || 33 === parseInt(arrayDevList[a].type, 16) || 51 === parseInt(arrayDevList[a].type, 16) ? i = !0 : 65 === parseInt(arrayDevList[a].type, 16) && (c = !0);
    t.type = "0x21",
    t.epc = "0x80",
    t.edt = "0x31",
    i === !0 && c === !0 ? (t.type2 = "0x41",
    t.epc2 = "0x80",
    t.edt2 = "0x31") : i === !1 && c === !0 && (t.type = "0x41"),
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.token = e,
    sendRequest(n, "get", t)
}
function onFhAllStop(e) {
    var n = "/action/devices/device/303"
      , t = {}
      , a = 0
      , i = !1
      , c = !1;
    for (a = 0; a < arrayDevList.length; a++)
        52 === parseInt(arrayDevList[a].type, 16) ? i = !0 : 67 === parseInt(arrayDevList[a].type, 16) && (c = !0);
    t.type = "0x34",
    t.epc = "0x80",
    t.edt = "0x31",
    i === !0 && c === !0 ? (t.type2 = "0x43",
    t.epc2 = "0x80",
    t.edt2 = "0x31") : i === !1 && c === !0 && (t.type = "0x43"),
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.token = e,
    sendRequest(n, "get", t)
}
function onadvLightAllOff(e, n) {
    var t = "/action/devices/device/303"
      , a = {};
    a.page = numPageNo,
    a.old_page = numOldPageNo,
    a.type = numToStrHex(42, 1),
    a.nodeId = e,
    a.token = n,
    sendRequest(t, "get", a)
}
function onLightAllOff(e) {
    var n = "/action/devices/device/303"
      , t = {};
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.type = "0x27",
    t.epc = "0x80",
    t.edt = "0x31",
    t.token = e,
    sendRequest(n, "get", t)
}
function onadvSwAllOff(e) {
    var n = "/action/devices/device/303"
      , t = {};
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.type = "0x92",
    t.token = e,
    sendRequest(n, "get", t)
}
function onShutterAllClose(e) {
    var n = "/action/devices/device/303"
      , t = {}
      , a = 0
      , i = !1
      , c = !1;
    for (a = 0; a < arrayDevList.length; a++)
        14 === parseInt(arrayDevList[a].type, 16) || 43 === parseInt(arrayDevList[a].type, 16) ? i = !0 : 66 === parseInt(arrayDevList[a].type, 16) && (c = !0);
    t.type = "0x0E",
    t.epc = "0xE0",
    t.edt = "0x42",
    i === !0 && c === !0 ? (t.type2 = "0x42",
    t.epc2 = "0x80",
    t.edt2 = "0x30") : i === !1 && c === !0 && (t.type = "0x42",
    t.epc = "0x80",
    t.edt = "0x30"),
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.token = e,
    sendRequest(n, "get", t)
}
function onShutterAllStop(e) {
    var n = "/action/devices/device/303"
      , t = {};
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.type = "0x0E",
    t.epc = "0xE0",
    t.edt = "0x43",
    t.token = e,
    sendRequest(n, "get", t)
}
function onShutterAllOpen(e) {
    var n = "/action/devices/device/303"
      , t = {}
      , a = 0
      , i = !1
      , c = !1;
    for (a = 0; a < arrayDevList.length; a++)
        14 === parseInt(arrayDevList[a].type, 16) || 43 === parseInt(arrayDevList[a].type, 16) ? i = !0 : 66 === parseInt(arrayDevList[a].type, 16) && (c = !0);
    t.type = "0x0E",
    t.epc = "0xE0",
    t.edt = "0x41",
    i === !0 && c === !0 ? (t.type2 = "0x42",
    t.epc2 = "0x80",
    t.edt2 = "0x31") : i === !1 && c === !0 && (t.type = "0x42",
    t.epc = "0x80",
    t.edt = "0x31"),
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.token = e,
    sendRequest(n, "get", t)
}
function onWindowAllClose(e) {
    var n = "/action/devices/device/303"
      , t = {};
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.type = "0x0F",
    t.epc = "0xE0",
    t.edt = "0x42",
    t.token = e,
    sendRequest(n, "get", t)
}
function onWindowAllStop(e) {
    var n = "/action/devices/device/303"
      , t = {};
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.type = "0x0F",
    t.epc = "0xE0",
    t.edt = "0x43",
    t.token = e,
    sendRequest(n, "get", t)
}
function onWindowAllOpen(e) {
    var n = "/action/devices/device/303"
      , t = {};
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.type = "0x0F",
    t.epc = "0xE0",
    t.edt = "0x41",
    t.token = e,
    sendRequest(n, "get", t)
}
function onAircleanerStop(e, n, t, a, i) {
    var c = "/action/devices/device/301"
      , l = {};
    l.page = numPageNo,
    l.old_page = numOldPageNo,
    l.nodeid = e,
    l.eoj = n,
    l.devtype = t,
    l.statecmd = a,
    l.token = i,
    sendRequest(c, "get", l)
}
function onRangehoodCtrl(e, n, t, a, i, c) {
    var l = "/action/devices/device/301"
      , d = {};
    d.page = numPageNo,
    d.old_page = numOldPageNo,
    d.nodeid = e,
    d.eoj = n,
    d.devtype = t,
    d.state = a,
    d.flowValue = i,
    d.token = c,
    sendRequest(l, "get", d)
}
function onJemaCtrl(e, n, t, a, i) {
    var c = "/action/devices/device/301"
      , l = {};
    l.page = numPageNo,
    l.old_page = numOldPageNo,
    l.nodeid = e,
    l.eoj = n,
    l.devtype = t,
    l.statecmd = a,
    l.token = i,
    sendRequest(c, "get", l)
}
function onLockCtrl(e, n, t, a, i) {
    var c = "/action/devices/device/301"
      , l = {};
    l.page = numPageNo,
    l.old_page = numOldPageNo,
    l.nodeid = e,
    l.eoj = n,
    l.devtype = t,
    l.statecmd = a,
    l.token = i,
    sendRequest(c, "get", l)
}
function onClickOpeMode() {
    var e = "";
    if (e = document.getElementById("ev_ctrl").innerHTML,
    skd = document.getElementById("ev_skd").innerHTML,
    "stop" === e) {
        if ("0" != skd)
            return void showPopup(!0, "popup");
        evOpeModeCtrl("stop")
    } else
        evOpeModeCtrl("start")
}
function evOpeModeCtrl(e) {
    var n = {}
      , t = "/action/devices/device/301"
      , a = {};
    n.token = document.getElementsByClassName("setting_value")[0].innerHTML,
    n.ctrlData = e,
    sendAjaxPostRequest("/action/devices/device/32/ctrl_elseev", n, function(e) {
        if (4 === e.readyState)
            if (0 === e.status)
                ;
            else if (200 === e.status || 304 === e.status) {
                var n = JSON.parse(e.responseText);
                "1" === n.result || (a.page = numPageNo,
                a.old_page = numOldPageNo,
                a.nodeid = n.nodeId,
                a.eoj = n.eoj,
                a.devtype = n.devType,
                a.statecmd = n.statecmd,
                a.token = n.token,
                sendRequest(t, "get", a))
            }
    })
}
function onClickEVSchedule() {
    var e = ""
      , n = "/page/devices/device/32f?page=" + numPageNo;
    e = document.getElementById("ev_pause").innerHTML,
    "2" == e ? showPopup(!0, "restart") : setTimeout(function() {
        location.href = n
    }, 100)
}
function evScheduleRestart() {
    var e = {}
      , n = "/page/devices/device/32f?page=" + numPageNo;
    e.token = document.getElementsByClassName("setting_value")[0].innerHTML,
    sendAjaxPostRequest("/action/devices/device/32/restart_evschedule", e, function(e) {
        if (4 === e.readyState)
            if (0 === e.status)
                ;
            else if (200 === e.status || 304 === e.status) {
                var t = JSON.parse(e.responseText);
                "1" === t.result || setTimeout(function() {
                    location.href = n
                }, 100)
            }
    })
}
function onWfAllStop(e) {
    var n = "/action/devices/device/303"
      , t = {};
    t.page = numPageNo,
    t.old_page = numOldPageNo,
    t.type = "0x3C",
    t.epc = "0x80",
    t.edt = "0x31",
    t.token = e,
    sendRequest(n, "get", t)
}
function onAiryCtrlMode(e, n, t, a, i) {
    var c = "0"
      , l = {}
      , d = {}
      , r = "w124 h46 radio "
      , o = " no_sound radio_on"
      , s = [[1, 1], [2, 1], [2, 2], [3, 1], [3, 2], [3, 3]]
      , h = 0
      , u = 1
      , p = 1
      , m = 1
      , _ = "airy_ctrl_" + a;
    for (c = document.getElementById(_).innerHTML,
    l = q(".popup_dialog_airymode").dom(),
    d = l[0].children[2].children[1].children[0].children,
    h = 0; 6 > h; h++)
        u = h + 1,
        p = s[h][0],
        m = s[h][1],
        d[u].className = r + "col_" + m + " row_" + p,
        d[u].children[1].href = "javascript:exeAiryCtrl(" + e + "," + n + "," + t + "," + u + "," + i + ");",
        u == parseInt(c, 10) && (d[u].className += o);
    showPopup(!0, "airymode")
}
function exeAiryCtrl(e, n, t, a, i) {
    var c = "/action/devices/device/301"
      , l = {};
    l.page = numPageNo,
    l.old_page = numOldPageNo,
    l.nodeid = e,
    l.eoj = n,
    l.devtype = t,
    l.statecmd = a,
    l.token = i,
    sendRequest(c, "get", l)
}
function onAiryCtrlGoOut(e, n, t, a, i) {
    var c = "0"
      , l = "airy_goout_" + a;
    c = document.getElementById(l).innerHTML;
    var d = "/action/devices/device/301_get"
      , r = {};
    r.page = numPageNo,
    r.old_page = numOldPageNo,
    r.nodeid = e,
    r.eoj = n,
    r.devtype = t,
    r.token = i,
    r.statecmd = JSON.stringify({
        goout: c
    }),
    sendRequest(d, "get", r)
}
function onCacheUpdate() {
    var e = 0
      , n = {}
      , t = !1;
    for (n.token = document.getElementsByClassName("setting_value")[0].innerHTML,
    numLockOnline = 0,
    e = 0; e < arrayDevList.length; e++)
        52 === parseInt(arrayDevList[e].type, 16) && (t = !0);
    sendAjaxPostRequest("/action/devices/device/32/update", n, function(e) {
        if (4 === e.readyState)
            if (0 === e.status)
                ;
            else if (200 === e.status || 304 === e.status) {
                var n = JSON.parse(e.responseText);
                n.advance_flg === !0 && (clearTimeout(numAdvUpdateTimer),
                upDateAdvance("1")),
                n.advance_sw_flg === !0 && upDateAdvanceSw(),
                n.fh_flg === !0 && (upDateFloorHeating(),
                t = !0)
            }
    }),
    t === !0 ? (q("#button_update").addClass("disable").find(".button_text").text("更新中"),
    setTimeout(function() {
        q("#button_update").removeClass("disable").find(".button_text").text("更新")
    }, 12e4)) : (q("#button_update").addClass("disable").find(".button_text").text("更新中"),
    setTimeout(function() {
        q("#button_update").removeClass("disable").find(".button_text").text("更新")
    }, 2e4))
}
function upDateAdvance(e) {
    var n = {};
    n.token = document.getElementsByClassName("setting_value")[0].innerHTML,
    n.type = e,
    sendAjaxPostRequest("/action/devices/device/32/update_adv", n, function(n) {
        if (4 === n.readyState)
            if (0 === n.status)
                ;
            else if (200 === n.status || 304 === n.status) {
                JSON.parse(n.responseText);
                "1" === e && (numAdvUpdateTimer = setTimeout(function() {
                    upDateAdvance("2")
                }, 5e3))
            }
    })
}
function upDateFloorHeating() {
    var e = {};
    e.token = document.getElementsByClassName("setting_value")[0].innerHTML,
    sendAjaxPostRequest("/action/devices/device/32/update_fh", e, function(e) {
        if (4 === e.readyState)
            if (0 === e.status)
                ;
            else if (200 === e.status || 304 === e.status) {
                JSON.parse(e.responseText)
            }
    })
}
function upDateAdvanceSw() {
    var e = {};
    e.token = document.getElementsByClassName("setting_value")[0].innerHTML,
    sendAjaxPostRequest("/action/devices/device/32/update_adv_sw", e, function(e) {})
}
function onClickRadioElseevCapaSetting() {
    var e = {}
      , n = "普通充電";
    e.token = document.getElementsByClassName("setting_value")[0].innerHTML;
    var t = q("#setting_value_evcapa").text();
    switch (t) {
    case ELSEEV_CAPASTATE.RAPID:
        e.capaState = ELSEEV_CAPASTATE.RAPID,
        n = "倍速充電";
        break;
    case ELSEEV_CAPASTATE.NOMAL:
        e.capaState = ELSEEV_CAPASTATE.NOMAL,
        n = "普通充電";
        break;
    case ELSEEV_CAPASTATE.SLOW:
        e.capaState = ELSEEV_CAPASTATE.SLOW,
        n = "低速充電";
        break;
    default:
        e.capaState = ELSEEV_CAPASTATE.NOMAL,
        n = "普通充電"
    }
    sendAjaxPostRequest("/action/devices/device/32/save_evcapacity", e, function(e) {
        if (4 === e.readyState)
            if (0 === e.status)
                ;
            else if (200 === e.status || 304 === e.status) {
                var a = JSON.parse(e.responseText);
                if ("1" === a.result)
                    ;
                else {
                    for (var i = 1; 5 > i; i++) {
                        var c = q("#panel_" + i).dom();
                        if ("elseev" === c.children[0].id) {
                            c.children[3].children[2].innerHTML = n,
                            c.children[4].children[1].children[1].href = "javascript:onClickEvCapacityShowPopup(true, '" + t + "')";
                            break
                        }
                    }
                    setTimeout(function() {
                        onClickEvCapacityShowPopup(!1, "0")
                    }, 100)
                }
            }
    })
}
function getNodeElements() {
    var e = {};
    return q(document.body).find(".wrap_kiki_bg").each(function(n) {
        e[n.attribute("nodeId").toString()] = n
    }),
    e
}
function autoUpdate(e, n, t) {
    var a = getQueryParams();
    a.list = arrayDevList,
    a.page = n,
    a.old_page = t,
    a.token = e,
    sendAjaxPostRequest("/data/devices/device/32/auto_update", a, function(a) {
        if (4 === a.readyState)
            if (0 === a.status)
                ;
            else if (200 === a.status || 304 === a.status) {
                var i = JSON.parse(a.responseText)
                  , c = {};
                if ("1" === i.reloadFlag)
                    return void (location.href = "/page/devices/device/32");
                for (var l = 1; 5 > l; l++) {
                    var d = q("#panel_" + l).dom();
                    if ("" !== d.className) {
                        switch (l) {
                        case 1:
                            c = i.list1;
                            break;
                        case 2:
                            c = i.list2;
                            break;
                        case 3:
                            c = i.list3;
                            break;
                        case 4:
                            c = i.list4
                        }
                        "enefarm" === d.children[0].id && (d.children[1].className = c.enefarm.icon,
                        d.children[4].children[0].innerHTML = c.enefarm.state,
                        d.children[4].children[0].className = "state lo-w314 " + c.enefarm.state_onoff + c.enefarm.state_font,
                        d.children[3].className = "button_rt button w112 h46 " + c.enefarm.btn1_disable,
                        d.children[5].children[0].children[0].innerHTML = c.enefarm.btn,
                        d.children[5].children[0].children[1].href = "javascript:onEnefarmHeat(" + c.enefarm.nodeid + "," + c.enefarm.eoj + "," + c.enefarm.devtype + "," + c.enefarm.bathcmd + "," + c.enefarm.token + ")",
                        d.children[5].children[0].className = "button w314 h46 " + c.enefarm.btn2_disable),
                        "lanEnefarm" === d.children[0].id && ("" === c.lanEnefarm.generate_button ? (d.children[1].className = c.lanEnefarm.icon,
                        d.children[4].children[0].innerHTML = c.lanEnefarm.bath_state,
                        d.children[4].children[0].className = "state lo-w314 " + c.lanEnefarm.bath_onoff + c.lanEnefarm.state_font,
                        d.children[3].className = "button_rt button w112 h46 " + c.lanEnefarm.btn1_disable,
                        d.children[5].children[0].children[0].innerHTML = c.lanEnefarm.bath_button,
                        d.children[5].children[0].children[1].href = "javascript:onEnefarmHeat(" + c.lanEnefarm.bath_nodeid + "," + c.lanEnefarm.bath_eoj + "," + c.lanEnefarm.bath_devtype + "," + c.lanEnefarm.bathcmd + "," + c.lanEnefarm.token + ")",
                        d.children[5].children[0].className = "button w314 h46 " + c.lanEnefarm.btn2_disable) : (d.children[1].className = c.lanEnefarm.icon,
                        d.children[3].className = "button_rt button w112 h46 " + c.lanEnefarm.btn1_disable,
                        d.children[4].children[0].innerHTML = c.lanEnefarm.bath_state,
                        d.children[4].children[0].className = "state lo-w154 " + c.lanEnefarm.bath_onoff + c.lanEnefarm.state_font,
                        d.children[4].children[1].innerHTML = c.lanEnefarm.generate_state,
                        d.children[4].children[1].className = "state lo-w154 " + c.lanEnefarm.generate_onoff + c.lanEnefarm.state_font,
                        d.children[5].children[0].children[0].innerHTML = c.lanEnefarm.bath_button,
                        d.children[5].children[0].className = "button w154 h46 " + c.lanEnefarm.btn2_disable,
                        d.children[5].children[0].children[1].href = "javascript:onEnefarmHeat(" + c.lanEnefarm.bath_nodeid + "," + c.lanEnefarm.bath_eoj + "," + c.lanEnefarm.bath_devtype + "," + c.lanEnefarm.bathcmd + "," + c.lanEnefarm.token + ")",
                        d.children[5].children[1].children[0].innerHTML = c.lanEnefarm.generate_button,
                        d.children[5].children[1].className = "button w154 h46 " + c.lanEnefarm.btn3_disable,
                        d.children[5].children[1].children[1].href = "javascript:onEnefarmGenerate(" + c.lanEnefarm.nodeid + "," + c.lanEnefarm.eoj + "," + c.lanEnefarm.devtype + "," + c.lanEnefarm.generatecmd + "," + c.lanEnefarm.token + ")")),
                        "ipenefarm" === d.children[0].id && (d.children[1].className = c.ip_hp.icon,
                        d.children[3].children[0].innerHTML = c.enefarm.state,
                        d.children[3].children[0].className = "state lo-w314 " + c.enefarm.state_onoff),
                        "ecocute" === d.children[0].id && (d.children[1].className = c.ecocute.icon,
                        d.children[3].children[0].children[0].innerHTML = c.ecocute.hw_level + "：",
                        d.children[3].children[0].children[1].innerHTML = c.ecocute.percent + "％",
                        d.children[4].className = "button_rt button w112 h46 " + c.ecocute.disable,
                        d.children[5].children[0].innerHTML = c.ecocute.heat_state,
                        d.children[5].children[0].className = "state lo-w154 " + c.ecocute.heat_onoff + c.ecocute.state_font,
                        "bath_disp_on" === c.ecocute.bath_disp && (d.children[5].children[1].innerHTML = c.ecocute.bath_state,
                        d.children[5].children[1].className = "state lo-w154 " + c.ecocute.bath_onoff + c.ecocute.state_font),
                        d.children[6].children[0].children[0].innerHTML = c.ecocute.heat_button,
                        d.children[6].children[0].className = "button w154 h46 " + c.ecocute.disable,
                        d.children[6].children[0].children[1].href = "javascript:onEcocuteHeat(" + c.ecocute.nodeid + "," + c.ecocute.eoj + "," + c.ecocute.devtype + "," + c.ecocute.heatcmd + "," + c.ecocute.token + ")",
                        "bath_disp_on" === c.ecocute.bath_disp && (d.children[6].children[1].children[0].innerHTML = c.ecocute.bath_button,
                        d.children[6].children[1].className = "button w154 h46 " + c.ecocute.disable,
                        d.children[6].children[1].children[1].href = "javascript:onEcocuteBath(" + c.ecocute.nodeid + "," + c.ecocute.eoj + "," + c.ecocute.devtype + "," + c.ecocute.bathcmd + "," + c.ecocute.token + ")")),
                        "ip_hp" === d.children[0].id && (d.children[1].className = c.ip_hp.icon,
                        d.children[3].children[0].innerHTML = c.ip_hp.state,
                        d.children[3].children[0].className = "state lo-w100 " + c.ip_hp.state_onoff + c.ip_hp.state_font,
                        d.children[4].children[0].className = "button w100 h46 " + c.ip_hp.btn1_disable,
                        d.children[4].children[1].className = "button w100 h46 " + c.ip_hp.btn2_disable,
                        d.children[4].children[2].className = "button w100 h46 " + c.ip_hp.btn3_disable),
                        "specific_hp" === d.children[0].id && (d.children[1].className = c.specific_hp.icon,
                        d.children[3].children[0].innerHTML = c.specific_hp.heat_state,
                        d.children[3].children[0].className = "state lo-w154 " + c.specific_hp.heat_onoff + c.specific_hp.state_font,
                        "bath_disp_on" === c.specific_hp.bath_disp && (d.children[3].children[1].innerHTML = c.specific_hp.bath_state,
                        d.children[3].children[1].className = "state lo-w154 " + c.specific_hp.bath_onoff + c.specific_hp.state_font),
                        d.children[4].children[0].children[0].innerHTML = c.specific_hp.heat_button,
                        d.children[4].children[0].className = "button w154 h46 " + c.specific_hp.heat_disable,
                        d.children[4].children[0].children[1].href = "javascript:onEcocuteHeat(" + c.specific_hp.nodeid + "," + c.specific_hp.eoj + "," + c.specific_hp.devtype + "," + c.specific_hp.heatcmd + "," + c.specific_hp.token + ")",
                        "bath_disp_on" === c.specific_hp.bath_disp && (d.children[4].children[1].children[0].innerHTML = c.specific_hp.bath_button,
                        d.children[4].children[1].className = "button w154 h46 " + c.specific_hp.bath_disable,
                        d.children[4].children[1].children[1].href = "javascript:onEcocuteBath(" + c.specific_hp.nodeid + "," + c.specific_hp.eoj + "," + c.specific_hp.devtype + "," + c.specific_hp.bathcmd + "," + c.specific_hp.token + ")")),
                        "gas_hp" === d.children[0].id && (d.children[1].className = c.gas_hp.icon,
                        d.children[3].children[0].innerHTML = c.gas_hp.state,
                        d.children[3].children[0].className = "state lo-w314 " + c.gas_hp.state_onoff + c.gas_hp.state_font,
                        d.children[4].children[0].children[0].innerHTML = c.gas_hp.btn,
                        d.children[4].children[0].className = "button w314 h46 " + c.gas_hp.btn1_disable,
                        d.children[4].children[0].children[1].href = "javascript:onEcocuteBath(" + c.gas_hp.nodeid + "," + c.gas_hp.eoj + "," + c.gas_hp.devtype + "," + c.gas_hp.bathcmd + "," + c.gas_hp.token + ")"),
                        "aircon" === d.children[0].id && (d.children[1].className = c.aircon.icon,
                        d.children[3].children[0].children[1].innerHTML = c.aircon.stop_num,
                        d.children[3].children[1].children[1].innerHTML = c.aircon.start_num,
                        d.children[4].children[0].className = "button w154 h46 " + c.aircon.all_stop),
                        "advlight" === d.children[0].id && (d.children[1].className = c.advLight.icon,
                        d.children[3].children[0].children[1].innerHTML = c.advLight.off_num,
                        d.children[3].children[1].children[1].innerHTML = c.advLight.on_num,
                        d.children[4].children[0].className = "button w154 h46 " + c.advLight.all_stop),
                        "light" === d.children[0].id && (d.children[1].className = c.light.icon,
                        d.children[3].children[0].children[1].innerHTML = c.light.off_num,
                        d.children[3].children[1].children[1].innerHTML = c.light.on_num,
                        d.children[4].children[0].className = "button w154 h46 " + c.light.all_stop),
                        "adv_sw" === d.children[0].id && (d.children[1].className = c.advSw.icon,
                        d.children[3].children[0].children[1].innerHTML = c.advSw.off_num,
                        d.children[3].children[1].children[1].innerHTML = c.advSw.on_num,
                        d.children[4].children[0].className = "button w154 h46 " + c.advSw.all_stop),
                        "shutter" === d.children[0].id && (d.children[1].className = c.shutter.icon,
                        d.children[3].children[0].children[1].innerHTML = c.shutter.open_num,
                        d.children[3].children[1].children[1].innerHTML = c.shutter.close_num,
                        d.children[5].children[0].className = "button w74 h46 " + c.shutter.dis_all_stop1,
                        d.children[5].children[0].children[0].className = "button_text " + c.shutter.btn_green,
                        d.children[5].children[1].className = "button w74 h46 " + c.shutter.dis_all_stop2,
                        d.children[5].children[2].className = "button w74 h46 " + c.shutter.dis_all_stop3),
                        "window" === d.children[0].id && (d.children[1].className = c.window.icon,
                        d.children[3].children[0].children[1].innerHTML = c.window.open_num,
                        d.children[3].children[1].children[1].innerHTML = c.window.close_num,
                        d.children[5].children[0].className = "button w74 h46 " + c.window.dis_all_stop,
                        d.children[5].children[0].children[0].className = "button_text " + c.window.btn_green,
                        d.children[5].children[1].className = "button w74 h46 " + c.window.dis_all_stop,
                        d.children[5].children[2].className = "button w74 h46 " + c.window.dis_all_stop),
                        "aircleaner" === d.children[0].id && (d.children[1].className = c.aircleaner.icon,
                        d.children[3].children[0].children[1].innerHTML = "：" + c.aircleaner.smell_val,
                        d.children[3].children[1].children[1].innerHTML = "：" + c.aircleaner.pm2_5_val,
                        d.children[3].children[2].children[1].innerHTML = "：" + c.aircleaner.dust_val,
                        d.children[4].children[0].innerHTML = c.aircleaner.state_run,
                        d.children[4].children[0].className = "state lo-w100 " + c.aircleaner.mode + c.aircleaner.state_font,
                        d.children[4].children[1].innerHTML = c.aircleaner.airme,
                        d.children[4].children[1].className = "state lo-w100 " + c.aircleaner.airme_visible + c.aircleaner.state_font,
                        d.children[4].children[2].innerHTML = c.aircleaner.timer,
                        d.children[4].children[2].className = "state lo-w100 " + c.aircleaner.state_font,
                        d.children[4].children[2].style.visibility = c.aircleaner.timer_visible,
                        d.children[5].children[0].className = "button w100 h46 " + c.aircleaner.dis_all_stop,
                        d.children[5].children[0].children[0].innerHTML = c.aircleaner.stop,
                        d.children[5].children[0].children[0].className = "button_text " + c.aircleaner.btn_green,
                        d.children[5].children[0].children[1].href = "javascript:onAircleanerStop(" + c.aircleaner.nodeid + "," + c.aircleaner.eoj + "," + c.aircleaner.devtype + "," + c.aircleaner.statecmd + "," + c.aircleaner.token + ")",
                        d.children[5].children[1].className = "button w100 h46 " + c.aircleaner.dis_all_stop),
                        "rangehood" === d.children[0].id && (d.children[1].className = c.rangehood.icon,
                        d.children[3].children[0].innerHTML = c.rangehood.state_run,
                        "お手入れ中" === c.rangehood.state_run ? d.children[3].children[0].className = "state lo-w101 " + c.rangehood.mode + c.rangehood.state_font : d.children[3].children[0].className = "state lo-w100 " + c.rangehood.mode + c.rangehood.state_font,
                        d.children[3].children[1].className = "state lo-w100 " + c.rangehood.wind_visible + c.rangehood.state_font,
                        d.children[3].children[1].innerHTML = c.rangehood.set_wind,
                        d.children[3].children[2].className = "state lo-w100 " + c.rangehood.state_font,
                        d.children[3].children[2].style.visibility = c.rangehood.timer_visible,
                        d.children[3].children[2].innerHTML = c.rangehood.timer,
                        d.children[4].children[0].className = "button w100 h46 " + c.rangehood.dis_all_stop,
                        d.children[4].children[0].children[0].innerHTML = c.rangehood.stop,
                        d.children[4].children[0].children[0].className = "button_text " + c.rangehood.btn_green,
                        d.children[4].children[0].children[1].href = "javascript:onRangehoodCtrl(" + c.rangehood.nodeid + "," + c.rangehood.eoj + "," + c.rangehood.devtype + "," + c.rangehood.ctrlcmd + "," + c.rangehood.flowvalue + "," + c.rangehood.token + ")",
                        d.children[4].children[1].className = "button w100 h46 " + c.rangehood.dis_all_stop,
                        d.children[4].children[1].children[0].innerHTML = c.rangehood.detail),
                        "ih" === d.children[0].id && (d.children[1].className = c.ih.icon,
                        d.children[3].children[0].innerHTML = c.ih.state_text,
                        d.children[3].children[0].className = "state lo-w100 " + c.ih.state + c.ih.state_font),
                        "fh" === d.children[0].id && (d.children[1].className = c.fh.icon,
                        d.children[3].children[0].children[1].innerHTML = c.fh.stop_num,
                        d.children[3].children[1].children[1].innerHTML = c.fh.start_num,
                        d.children[4].children[0].className = "button w154 h46 " + c.fh.all_stop),
                        "jema" === d.children[0].id && (d.children[1].className = c.jema.icon,
                        d.children[3].children[0].innerHTML = c.jema.state,
                        d.children[3].children[0].className = "state lo-w314 " + c.jema.state_onoff + c.jema.state_font,
                        d.children[4].children[0].className = "button w314 h46 " + c.jema.btn_disable),
                        "lock" === d.children[0].id && (0 !== numLockOnline && "disable" === c.lock.btn1_disable || (d.children[1].className = c.lock.icon,
                        d.children[4].children[0].innerHTML = c.lock.state,
                        d.children[4].children[0].className = "state lo-w314 " + c.lock.state_onoff + c.lock.state_font,
                        d.children[5].children[0].className = "button w314 h46 " + c.lock.btn1_disable,
                        d.children[5].children[0].children[1].href = "javascript:onLockCtrl(" + c.lock.nodeid + "," + c.lock.eoj + "," + c.lock.devtype + "," + c.lock.statecmd + "," + c.lock.token + ")",
                        "disable" !== c.lock.btn1_disable && (numLockOnline = 1))),
                        "swinit" === d.children[0].id && (d.children[1].className = c.swinit.icon,
                        d.children[3].children[0].innerHTML = c.swinit.state,
                        d.children[3].children[0].className = "state lo-w314 " + c.swinit.state_onoff + c.swinit.state_font),
                        "alauno" === d.children[0].id && (d.children[1].className = c.alauno.icon,
                        d.children[3].children[0].children[1].innerHTML = c.alauno.state_leave),
                        "call" === d.children[0].id && (d.children[1].className = c.call.icon,
                        d.children[4].className = "battery_val" + c.call.icon_battery,
                        d.children[3].children[0].children[1].innerHTML = c.call.state_time),
                        "deliverybox" === d.children[0].id && (d.children[1].className = c.deliverybox.icon,
                        d.children[3].children[0].children[0].innerHTML = c.deliverybox.val,
                        d.children[3].children[0].children[0].className = c.deliverybox.val_color,
                        d.children[4].className = "battery_val" + c.deliverybox.battery_lv),
                        "elseev" === d.children[0].id && (d.children[1].className = c.elseev.icon,
                        d.children[2].innerHTML = c.elseev.name,
                        d.children[3].children[0].innerHTML = c.elseev.state_evCtrl,
                        d.children[3].children[1].className = "state lo-w100 " + c.elseev.state_opeModeColor,
                        d.children[3].children[1].innerHTML = c.elseev.state_opeMode,
                        d.children[4].children[0].className = "button w100 h46 " + c.elseev.btn_opeModeEnable,
                        d.children[4].children[0].children[0].innerHTML = c.elseev.btn_opeMode,
                        d.children[3].children[2].innerHTML = c.elseev.state_cCapSetting,
                        d.children[4].children[1].className = "button w100 h46 " + c.elseev.btn_cCapSettingEnable,
                        d.children[4].children[1].children[1].href = "javascript:onClickEvCapacityShowPopup(true, '" + c.elseev.radio_cCapSetting + "')",
                        d.children[3].children[3].innerHTML = c.elseev.state_evSKD,
                        d.children[3].children[4].innerHTML = c.elseev.state_schedule,
                        d.children[4].children[2].children[0].innerHTML = c.elseev.state_evPause),
                        "wf" === d.children[0].id && (d.children[1].className = c.wf.icon,
                        d.children[3].children[0].children[1].innerHTML = c.wf.stop_num,
                        d.children[3].children[1].children[1].innerHTML = c.wf.start_num),
                        "jukeiki" === d.children[0].id && (d.children[1].className = c.jukeiki.icon,
                        d.children[3].children[0].children[0].innerHTML = c.jukeiki.val,
                        d.children[4].className = "battery_val" + c.jukeiki.icon_battery),
                        "airy" === d.children[0].id && (d.children[1].className = c.airy.icon,
                        d.children[3].children[0].innerHTML = c.airy.mode,
                        d.children[3].children[1].style.color = c.airy.mode_color,
                        d.children[3].children[1].innerHTML = c.airy.mode_disp,
                        d.children[3].children[3].innerHTML = c.airy.goout,
                        d.children[3].children[4].innerHTML = c.airy.goout_disp,
                        d.children[4].children[0].className = "button w100 h46 " + c.airy.mode_disable,
                        d.children[4].children[1].className = "button w100 h46 " + c.airy.integ_disable,
                        d.children[4].children[2].className = "button w100 h46 " + c.airy.goout_disable,
                        d.children[4].children[2].children[0].className = "button_text " + c.airy.goout_line,
                        d.children[4].children[2].children[0].innerHTML = c.airy.goout_button)
                    }
                }
                setTimeout(function() {
                    autoUpdate(e, n, t)
                }, 5e3)
            }
    })
}
function onClickTab1() {
    var e = "/page/devices/scene/31"
      , n = {};
    sendRequest(e, "get", n)
}
function showPopup(e, n) {
    switch (q(".popup_dialog_" + n).css("display", e ? "block" : "none"),
    n) {
    case "015":
        e && (numAnimeCount = 1,
        animationMessage());
        break;
    case "017":
        break;
    case "popup":
        q(".popup_dialog_" + n).css("visibility", e ? "visible" : "hidden");
        break;
    case "restart":
        q(".popup_dialog_" + n).css("visibility", e ? "visible" : "hidden");
        break;
    case "airymode":
        q(".popup_dialog_" + n).css("visibility", e ? "visible" : "hidden")
    }
}
function onClickPopupClose(e) {
    showPopup(!1, "017")
}
function onClickEvCapacityShowPopup(e, n) {
    var t = "radio w154 h46"
      , a = " no_sound radio_on";
    if (!1 !== e) {
        var i = q("#button_wrapper_evcapacity").dom();
        i.children[0].className = t,
        i.children[1].className = t,
        i.children[2].className = t,
        i.children[parseInt(n, 10) - 1].className = t + a
    }
    setTimeout(function() {
        showPopup(e, "evcapacity")
    }, 100)
}
function animationMessage() {
    for (var e = "", n = 0; numAnimeCount > n; n++)
        e += ".";
    q("#loader_anime").text(e),
    numAnimeCount++,
    6 === numAnimeCount && (numAnimeCount = 1),
    numAnimeTimer = setTimeout(function() {
        animationMessage()
    }, 400)
}
var NUM_OF_DEVICE_PER_PAGE = 4
  , BAR_MAX_SIZE = 241
  , numPageTotal = 1
  , numPageNo = 1
  , numOldPageNo = 1
  , numAnimeCount = 0
  , numAnimeTimer = 0
  , numAdvUpdateTimer = 0
  , arrayDevList = []
  , numLockOnline = 0
  , ELSEEV_CAPASTATE = {
    RAPID: "1",
    NOMAL: "2",
    SLOW: "3"
};
