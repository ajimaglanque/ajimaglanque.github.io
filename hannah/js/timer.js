(function () {
  var DAY_MS = 1000 * 60 * 60 * 24;
  var HOUR_MS = 1000 * 60 * 60;
  var MINUTE_MS = 1000 * 60;

  // +08:00 anchors this to Philippine Time specifically, regardless of
  // the visitor's own device timezone — a bare "2026-09-28T13:00:00"
  // (no offset) would instead target 1pm in each visitor's own local
  // time, which isn't what we want here.
  var endDate = new Date("2026-09-28T13:00:00+08:00").getTime();

  var daysEl = document.getElementById("days");
  var hoursEl = document.getElementById("hours");
  var minutesEl = document.getElementById("minutes");
  var secondsEl = document.getElementById("seconds");

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  var timer = setInterval(function () {
    var remaining = endDate - new Date().getTime();

    if (remaining <= 0) {
      clearInterval(timer);
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    daysEl.textContent = pad(Math.floor(remaining / DAY_MS));
    hoursEl.textContent = pad(Math.floor((remaining % DAY_MS) / HOUR_MS));
    minutesEl.textContent = pad(Math.floor((remaining % HOUR_MS) / MINUTE_MS));
    secondsEl.textContent = pad(Math.floor((remaining % MINUTE_MS) / 1000));
  }, 1000);
})();
