function TimeDisplay() {
    if (TimeInfoVariable.serverTime) {
        var e = new Date
          , i = e.getTime() - TimeInfoVariable.currentTime.getTime();
        if (!TimeInfoVariable.serverDate) {
            var a = JSON.parse(TimeInfoVariable.serverTime);
            TimeInfoVariable.serverDate = new Date("20" + a.year,(parseInt(a.month) - 1).toString(),a.day,a.hour,a.min,a.sec)
        }
        var r = TimeInfoVariable.serverDate;
        r.setTime(r.getTime() + i),
        TimeInfoVariable.currentTime = e;
        var t = "";
        if (r >= new Date(2038,0))
            clearInterval(TimeInfoVariable.timer),
            t = "0000/00/00&nbsp;&nbsp;00:00";
        else {
            var n = r.getFullYear()
              , m = ("0" + (r.getMonth() + 1)).slice(-2)
              , l = r.getDay()
              , T = ("0" + r.getDate()).slice(-2)
              , s = new Array("日","月","火","水","木","金","土")
              , o = ("0" + r.getHours()).slice(-2)
              , f = ("0" + r.getMinutes()).slice(-2);
            t = n + "/" + m + "/" + T + " (" + s[l] + ") " + o + ":" + f
        }
        document.getElementById("h_datetime").innerHTML = t
    } else
        clearInterval(TimeInfoVariable.timer)
}
"object" != typeof TimeInfoVariable && (TimeInfoVariable = {}),
TimeInfoVariable.timer = setInterval(TimeDisplay, 5e3),
TimeInfoVariable.currentTime = new Date,
TimeDisplay();
