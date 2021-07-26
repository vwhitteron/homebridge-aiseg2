function checkNGChar(e) {
    var t = /[!\#"$%&'()=\-~^|\\`@{[+;\*:}\]<,>.\/_\?]/;
    return !t.test(e)
}
function nullCheck(e) {
    return void 0 === e || null === e
}
function numToStrHex(e, t) {
    var r, n = e.toString(16), a = "";
    for (r = 0; r < 2 * t - n.length; r++)
        a += "0";
    return n = a + n,
    n = "0x" + n
}
function toggleClassByBoolSP(e, t, r) {
    return toggleClassByBool(e, t, r)
}
function strNumCheck(e) {
    if (void 0 === e || null === e)
        return !0;
    if (e === !0 || e === !1)
        return !0;
    if ("" === e)
        return !0;
    var t = /[!\#"$%&'()=\-~^|\\`@{[+;\*:}\]<,>.\/_\?\s]/;
    return t.test(e) ? !0 : !!isNaN(e)
}
function ZeroPadding(e, t) {
    if (null !== e) {
        var r = e.value;
        if (!(nullCheck(r) || "" === r || nullCheck(t) && (t = e.getAttribute("maxlength"),
        null === t || "" === t))) {
            for (var n = "", a = 1; t >= a; a++)
                n += "0";
            e.value = (n + r).slice(-1 * t).toString()
        }
    }
}
function combineNumber(e, t, r) {
    for (var n = "", a = 0; a < r - t.length; a++)
        n += "0";
    return "" + e + t + n
}
function getTargetPropObj(e, t) {
    var r, n, a = {};
    for (r in e)
        for (n = 0; n < t.length; n++)
            r === t[n] && (a[r] = e[r]);
    return a
}
function isPreviousDateValid(e, t) {
    if (!TimeInfoVariable.serverDate) {
        var r = JSON.parse(TimeInfoVariable.serverTime);
        TimeInfoVariable.serverDate = new Date("20" + r.year,(parseInt(r.month) - 1).toString(),r.day,r.hour,r.min,r.sec)
    }
    var n = TimeInfoVariable.serverDate
      , a = null;
    if (e.length < 3 || e.indexOf(null) >= 0 || e.indexOf(void 0) >= 0) {
        var l = new Date;
        a = [l.getFullYear(), l.getMonth(), l.getDate()]
    } else
        e[1] -= 1;
    var i = null
      , D = null
      , o = null
      , u = !0;
    switch (t) {
    case "week":
        a = new Date(e[0],e[1],e[2]);
        var T = new Date(e[0],e[1],e[2] + 6);
        o = GRAPH.WEEK,
        i = new Date(n.getFullYear(),n.getMonth() - o.PREV_LIMIT,n.getDate()),
        D = new Date(o.OLDEST_DATE[0],o.OLDEST_DATE[1] - 1,o.OLDEST_DATE[2]);
        break;
    case "month":
        a = new Date(e[0],e[1],1),
        o = GRAPH.MONTH,
        i = new Date(n.getFullYear(),n.getMonth() - o.PREV_LIMIT,1),
        D = new Date(o.OLDEST_DATE[0],o.OLDEST_DATE[1] - 1),
        n.setDate(1);
        break;
    case "year":
        a = new Date(e[0],0,1),
        o = GRAPH.YEAR,
        i = new Date(n.getFullYear() - o.PREV_LIMIT,0,1),
        D = new Date(o.OLDEST_DATE[0],o.OLDEST_DATE[1] - 1),
        n.setMonth(0, 1);
        break;
    default:
        a = new Date(e[0],e[1],e[2]),
        o = GRAPH.DAY,
        i = new Date(n.getFullYear(),n.getMonth(),n.getDate() - o.PREV_LIMIT),
        D = new Date(o.OLDEST_DATE[0],o.OLDEST_DATE[1] - 1,o.OLDEST_DATE[2])
    }
    return a.setHours(0, 0, 0, 0),
    i.setHours(0, 0, 0, 0),
    e[1] += 1,
    "week" === t ? (i > T && i > a || D > a) && (u = !1) : (i > a || D > a) && (u = !1),
    u
}
function isNextDateValid(e, t) {
    if (!TimeInfoVariable.serverDate) {
        var r = JSON.parse(TimeInfoVariable.serverTime);
        TimeInfoVariable.serverDate = new Date("20" + r.year,(parseInt(r.month) - 1).toString(),r.day,r.hour,r.min,r.sec)
    }
    var n = TimeInfoVariable.serverDate
      , a = null;
    if (e.length < 3 || e.indexOf(null) >= 0 || e.indexOf(void 0) >= 0) {
        var l = new Date;
        a = [l.getFullYear(), l.getMonth(), l.getDate()]
    } else
        e[1] -= 1;
    var i = !0;
    switch (t) {
    case "week":
        a = new Date(e[0],e[1],e[2]);
        break;
    case "month":
        a = new Date(e[0],e[1],1),
        n.setDate(1);
        break;
    case "year":
        a = new Date(e[0],0,1),
        n.setMonth(0, 1);
        break;
    default:
        a = new Date(e[0],e[1],e[2])
    }
    return n.setHours(0, 0, 0, 0),
    a.setHours(0, 0, 0, 0),
    e[1] += 1,
    a > n && (i = !1),
    i
}
function dateFormat(e, t) {
    var r = e;
    return "-" === e || "" === e ? "" : ("YYYY/MM/DD" === t && 8 === e.length && (r = e.slice(0, 4),
    r += "/",
    r += e.slice(4, 6),
    r += "/",
    r += e.slice(6, 8)),
    r)
}
function makeQueryStr(e, t) {
    if (null !== e && void 0 !== e || (e = ""),
    null === t || void 0 === t)
        return e;
    var r = "";
    for (var n in t)
        null !== t[n] && void 0 !== t[n] && (r += "&" + n + "=" + t[n]);
    return r = r.replace(/^&/, "?"),
    e + r
}
var AGENTTYPE = {
    VIERA: "0",
    HOME_CTRL: "1",
    JM_MON: "2",
    HM_MON: "3",
    MOBILE: "4",
    PC: "5"
}
  , GRAPH = {
    DAY: {
        PREV_LIMIT: 34,
        OLDEST_DATE: [2012, 1, 1]
    },
    WEEK: {
        PREV_LIMIT: 12,
        OLDEST_DATE: [2011, 12, 26]
    },
    MONTH: {
        PREV_LIMIT: 12,
        OLDEST_DATE: [2012, 1, 1]
    },
    YEAR: {
        PREV_LIMIT: 10,
        OLDEST_DATE: [2012, 1, 1]
    }
};
