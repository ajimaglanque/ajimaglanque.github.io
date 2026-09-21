/*
 * Touch devices have no :hover state, so the CSS hover-to-pause rule
 * on the marquee never fires there. This adds the touch equivalent:
 * holding a finger down on a row pauses its scroll (same intent as
 * hovering with a mouse — pause long enough to read a card), and it
 * resumes as soon as the finger lifts or the touch is interrupted.
 */
(function () {
  var rows = document.querySelectorAll(".marquee-row");

  rows.forEach(function (row) {
    var pause = function () {
      row.classList.add("is-touched");
    };
    var resume = function () {
      row.classList.remove("is-touched");
    };

    row.addEventListener("touchstart", pause, { passive: true });
    row.addEventListener("touchend", resume);
    row.addEventListener("touchcancel", resume);
  });
})();
