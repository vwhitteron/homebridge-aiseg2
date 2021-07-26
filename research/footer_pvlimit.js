function footerPvlimitUpdate(t) {
    sendAjaxPostRequest("/data/pvlimit/update", {}, function(t) {
        if (4 === t.readyState)
            if (0 === t.status)
                ;
            else if (200 === t.status || 304 === t.status) {
                var e = JSON.parse(t.responseText);
                "1" === e.pvlimit.status ? ("1" === e.pvlimit.type ? q("#pvlimit_label").addClass("updatedSchedule") : q("#pvlimit_label").removeClass("updatedSchedule"),
                q("#pvlimit_label").dom().style.display = "block") : q("#pvlimit_label").dom().style.display = "none"
            }
    }, {
        noerr: !0
    })
}
var footerpvlimitTimer;
footerpvlimitTimer = setInterval(footerPvlimitUpdate, 5e3);
