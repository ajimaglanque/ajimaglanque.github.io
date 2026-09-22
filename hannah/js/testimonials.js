/*
 * Pulls testimonial rows from a Google Sheet (populated by a linked
 * Google Form) and renders them into the marquee on reveal.html.
 *
 * SETUP: see hannah/REVEAL-GUIDE.md — you need to fill in SHEET_ID
 * below, and check that COLS matches your form's field order.
 *
 * Fetching Google Sheets data with fetch()/XHR fails cross-origin
 * (Google doesn't send CORS headers for it), so this uses the old
 * JSONP trick instead: load the sheet's data endpoint as a <script>
 * tag with a callback name, which isn't subject to CORS at all.
 */
(function () {
  var CONFIG = {
    // From the sheet's URL: https://docs.google.com/spreadsheets/d/THIS_PART/edit
    SHEET_ID: "1VAImZVWLy5G3SR0mGITXr2aQn3diqK8FF40Hp8ZlJbA",

    // The tab name holding form responses. Google Forms creates this
    // automatically — check the tab label at the bottom of the sheet.
    SHEET_NAME: "Form Responses 1",

    // 0-indexed columns. Column 0 is always "Timestamp" (Google Forms
    // adds it automatically). Columns 1+ follow the order your form
    // questions are in. Adjust if your form order differs.
    COLS: {
      question1: 1,
      question2: 2,
      handle: 3,
    },

    // Re-fetch periodically so new form submissions show up without a
    // page reload, while someone's looking at it. Set to 0 to disable.
    REFRESH_MS: 5 * 60 * 1000,

    // Cards look sparse if there are only 1-2 real responses; repeat
    // the set until it reaches this many before it's duplicated again
    // for the seamless scroll loop.
    MIN_CARDS_PER_ROW: 5,
  };

  // Darkened from the original brand palette so white avatar initials
  // hit at least 4.5:1 contrast (WCAG AA) against each — several of the
  // originals (esp. the yellow/green) were as low as ~1.9:1 to ~3:1.
  var AVATAR_COLORS = [
    "#cc4a21",
    "#7c3aed",
    "#0b8482",
    "#937105",
    "#cd3f85",
    "#178841",
    "#3574db",
    "#c05911",
  ];

  function initials(handle) {
    var clean = String(handle || "").replace(/^[@\s]+/, "");
    var parts = clean.split(/[\s_.-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || "?";
  }

  function colorFor(index) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  // Filled in from the sheet's own column headers once a fetch succeeds
  // (Google Forms uses the exact question text as the header), so the
  // real question wording never has to be typed in here by hand.
  var questionLabels = {
    question1: "Question 1",
    question2: "Question 2",
  };

  function qaHtml(label, answer) {
    if (!answer) return "";
    return (
      '<div class="quote-qa">' +
      '<span class="quote-question">' +
      escapeHtml(label) +
      "</span>" +
      '<p class="quote-answer">' +
      escapeHtml(answer) +
      "</p>" +
      "</div>"
    );
  }

  function cardHtml(item, index) {
    return (
      '<li class="quote-card">' +
      qaHtml(questionLabels.question1, item.question1) +
      qaHtml(questionLabels.question2, item.question2) +
      '<div class="quote-author">' +
      '<span class="quote-avatar" style="background: ' +
      colorFor(index) +
      '">' +
      escapeHtml(initials(item.handle)) +
      "</span>" +
      '<span class="quote-name">' +
      escapeHtml(item.handle) +
      "</span>" +
      "</div>" +
      "</li>"
    );
  }

  function padToMinimum(items, minCount) {
    if (items.length === 0) return items;
    var out = items.slice();
    var i = 0;
    while (out.length < minCount) {
      out.push(items[i % items.length]);
      i++;
    }
    return out;
  }

  // Swapping a row's HTML while its CSS scroll animation is mid-flight
  // makes the content visibly jump/cut, since the animation keeps
  // running against a box that just changed size underneath it. This
  // restarts the animation cleanly from 0% right after new content is
  // in place, and is also why we skip the swap entirely below when the
  // data hasn't actually changed (e.g. on the periodic re-fetch).
  function restartAnimation(track) {
    var group = track.closest(".marquee-track-group");
    if (!group) return;
    group.style.animation = "none";
    void group.offsetWidth; // force reflow so the "none" actually applies
    group.style.animation = "";
  }

  var lastRendered = {};

  function renderRow(items, trackId, dupTrackId) {
    var track = document.getElementById(trackId);
    var dupTrack = document.getElementById(dupTrackId);
    if (!track || !dupTrack || items.length === 0) return;

    var padded = padToMinimum(items, CONFIG.MIN_CARDS_PER_ROW);
    var signature = JSON.stringify(padded);
    if (lastRendered[trackId] === signature) return; // no real change
    lastRendered[trackId] = signature;

    var html = padded.map(cardHtml).join("");
    track.innerHTML = html;
    dupTrack.innerHTML = html;
    restartAnimation(track);
  }

  function render(items) {
    if (!items || items.length === 0) return; // keep fallback placeholders

    var rowA = [];
    var rowB = [];
    items.forEach(function (item, i) {
      (i % 2 === 0 ? rowA : rowB).push(item);
    });

    renderRow(rowA, "track-a-1", "track-a-2");
    renderRow(rowB.length ? rowB : rowA, "track-b-1", "track-b-2");
  }

  function parseGvizTable(table) {
    var cols = (table && table.cols) || [];
    var rows = (table && table.rows) || [];
    var items = [];

    var label1 = cols[CONFIG.COLS.question1] && cols[CONFIG.COLS.question1].label;
    var label2 = cols[CONFIG.COLS.question2] && cols[CONFIG.COLS.question2].label;
    if (label1) questionLabels.question1 = label1;
    if (label2) questionLabels.question2 = label2;

    rows.forEach(function (row) {
      var cells = row.c || [];
      var get = function (idx) {
        var cell = cells[idx];
        return cell && cell.v != null ? String(cell.v).trim() : "";
      };

      var question1 = get(CONFIG.COLS.question1);
      var question2 = get(CONFIG.COLS.question2);
      var handle = get(CONFIG.COLS.handle);

      if (question1 || question2 || handle) {
        items.push({
          question1: question1,
          question2: question2,
          handle: handle || "anonymous",
        });
      }
    });

    return items;
  }

  function fetchTestimonials() {
    if (!CONFIG.SHEET_ID || CONFIG.SHEET_ID === "PASTE_YOUR_SHEET_ID_HERE") {
      return; // not configured yet — leave the fallback placeholders
    }

    var callbackName = "__testimonialsJsonpCallback";
    var script = document.createElement("script");

    window[callbackName] = function (response) {
      try {
        var items = parseGvizTable(response && response.table);
        render(items);
      } catch (err) {
        console.warn("testimonials: failed to parse sheet response", err);
      }
      script.remove();
      delete window[callbackName];
    };

    var url =
      "https://docs.google.com/spreadsheets/d/" +
      encodeURIComponent(CONFIG.SHEET_ID) +
      "/gviz/tq?tqx=out:json;responseHandler:" +
      callbackName +
      "&sheet=" +
      encodeURIComponent(CONFIG.SHEET_NAME);

    script.src = url;
    script.onerror = function () {
      console.warn("testimonials: could not load the Google Sheet");
      delete window[callbackName];
    };
    document.body.appendChild(script);
  }

  fetchTestimonials();
  if (CONFIG.REFRESH_MS > 0) {
    setInterval(fetchTestimonials, CONFIG.REFRESH_MS);
  }
})();
