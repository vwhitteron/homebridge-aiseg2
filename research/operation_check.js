function stratCheckTimer() {
    var e = new OperationCheck;
    checkTimer = setInterval(function() {
        e.check()
    }, 1e3)
}
function stopCheckTimer() {
    clearInterval(checkTimer)
}
var OperationCheck = function() {}, checkTimer;
OperationCheck.prototype.time = 0,
OperationCheck.prototype.check = function() {
    this.time++,
    this.time >= 240 && sendRequest("/page/common/011", "POST", {
        redirect: document.location.href,
        referrer: document.referrer
    })
}
,
OperationCheck.prototype.reset = function() {
    this.time = 0
}
,
document.addEventListener("DOMContentLoaded", function() {
    var e = new OperationCheck;
    checkTimer = setInterval(function() {
        e.check()
    }, 1e3),
    document.addEventListener("click", function(t) {
        e.reset()
    })
});
