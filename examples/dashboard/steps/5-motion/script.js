// Lumen dashboard: chart hover, date-range menu, mobile navigation.
(function () {
  "use strict";

  /* ---------- Chart tooltip ---------- */
  var visitors = [1316, 1392, 1384, 1305, 946, 960, 1418, 1371, 1488, 1491, 1589, 1137, 1038, 1490, 1476,
    1590, 1584, 2011, 1182, 1133, 1619, 1711, 1598, 1677, 1740, 1306, 1219, 1643, 1629, 1821];
  var previous = [1197, 1191, 1241, 1269, 909, 876, 1336, 1249, 1367, 1287, 1238, 923, 908, 1378, 1347,
    1319, 1275, 1304, 969, 992, 1337, 1408, 1394, 1450, 1358, 961, 1043, 1410, 1446, 1436];
  var MAX = 2500;
  var start = new Date(2026, 9, 6);
  var fmtDate = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
  var fmtNum = new Intl.NumberFormat("en-US");

  var plot = document.getElementById("plot");
  var hover = document.getElementById("hover");
  var dot = hover.querySelector(".hover-dot");
  var tooltip = document.getElementById("tooltip");
  var last = -1;
  var n = visitors.length;

  function show(i) {
    if (i === last) return;
    last = i;
    var x = (i / (n - 1)) * 100;
    hover.style.left = x + "%";
    dot.style.top = (100 - (visitors[i] / MAX) * 100) + "%";

    var d = new Date(start);
    d.setDate(start.getDate() + i);
    var change = ((visitors[i] - previous[i]) / previous[i]) * 100;
    var dir = change >= 0 ? "up" : "down";
    tooltip.innerHTML =
      '<div class="tt-date">' + fmtDate.format(d) + "</div>" +
      '<div class="tt-row"><span class="swatch swatch-current"></span>Visitors<b>' + fmtNum.format(visitors[i]) + "</b></div>" +
      '<div class="tt-row"><span class="swatch swatch-prev"></span>Previous<b>' + fmtNum.format(previous[i]) + "</b></div>" +
      '<div class="tt-delta ' + dir + '">' + (change >= 0 ? "+" : "−") + Math.abs(change).toFixed(1) + "% vs previous period</div>";

    // Keep the tooltip inside the plot: flip to the left of the cursor past the midpoint.
    var w = plot.clientWidth;
    var px = (x / 100) * w;
    var tw = tooltip.offsetWidth;
    var left = px + 14;
    if (left + tw > w) left = px - tw - 14;
    tooltip.style.left = Math.max(0, left) + "px";
  }

  function onMove(e) {
    var rect = plot.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    plot.classList.add("is-hovering");
    show(Math.round(ratio * (n - 1)));
  }

  function onLeave() {
    plot.classList.remove("is-hovering");
    last = -1;
  }

  plot.addEventListener("mousemove", onMove);
  plot.addEventListener("mouseleave", onLeave);
  plot.addEventListener("touchstart", onMove, { passive: true });
  plot.addEventListener("touchmove", onMove, { passive: true });
  plot.addEventListener("touchend", onLeave);

  /* ---------- Date range menu ---------- */
  var rangeBtn = document.getElementById("rangeBtn");
  var rangeMenu = document.getElementById("rangeMenu");
  var rangeLabel = document.getElementById("rangeLabel");
  var options = Array.prototype.slice.call(rangeMenu.querySelectorAll('[role="option"]'));

  var closeTimer = null;

  function openMenu() {
    clearTimeout(closeTimer); // re-opening during the exit takes over at once
    rangeMenu.classList.remove("is-closing");
    rangeMenu.hidden = false;
    rangeBtn.setAttribute("aria-expanded", "true");
    var current = rangeMenu.querySelector('[aria-selected="true"]') || options[0];
    current.focus();
  }

  // The exit runs in CSS (--dur-exit); the menu is hidden when it ends. Focus and state move at once.
  function closeMenu(returnFocus) {
    rangeBtn.setAttribute("aria-expanded", "false");
    if (returnFocus) rangeBtn.focus();
    rangeMenu.classList.add("is-closing");
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      rangeMenu.hidden = true;
      rangeMenu.classList.remove("is-closing");
    }, 100);
  }

  function choose(opt) {
    options.forEach(function (o) { o.removeAttribute("aria-selected"); });
    opt.setAttribute("aria-selected", "true");
    rangeLabel.textContent = opt.dataset.label;
    closeMenu(true);
  }

  rangeBtn.addEventListener("click", function () {
    rangeBtn.getAttribute("aria-expanded") === "true" ? closeMenu(false) : openMenu();
  });

  rangeMenu.addEventListener("click", function (e) {
    var opt = e.target.closest('[role="option"]');
    if (opt) choose(opt);
  });

  rangeMenu.addEventListener("keydown", function (e) {
    var i = options.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); options[(i + 1) % options.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); options[(i - 1 + options.length) % options.length].focus(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i > -1) choose(options[i]); }
    else if (e.key === "Escape") { closeMenu(true); }
    else if (e.key === "Tab") { closeMenu(false); }
  });

  document.addEventListener("click", function (e) {
    if (rangeBtn.getAttribute("aria-expanded") === "true" && !e.target.closest("#range")) closeMenu(false);
  });

  /* ---------- Search shortcut ---------- */
  var search = document.querySelector(".search input");
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      search.focus();
    }
  });

  /* ---------- Mobile navigation ---------- */
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");
  var menuBtn = document.getElementById("menuBtn");

  // The sheet is modal: closing it, however it closes, hands focus back to the button that opened it.
  function setNav(open) {
    var wasOpen = sidebar.classList.contains("is-open");
    sidebar.classList.toggle("is-open", open);
    scrim.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    if (open) { var first = sidebar.querySelector("a, button"); if (first) first.focus(); }
    else if (wasOpen) { menuBtn.focus(); }
  }

  menuBtn.addEventListener("click", function () { setNav(!sidebar.classList.contains("is-open")); });
  scrim.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) setNav(false);
  });
})();
