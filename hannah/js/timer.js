(function () {
  var DAY_MS = 1000 * 60 * 60 * 24;
  var HOUR_MS = 1000 * 60 * 60;
  var MINUTE_MS = 1000 * 60;

  // Defaults to 30 days from first page load — change this to a fixed
  // launch date, e.g. new Date("2026-12-01T00:00:00").getTime()
  var endDate = new Date("2026-09-28T00:00:00").getTime();

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
