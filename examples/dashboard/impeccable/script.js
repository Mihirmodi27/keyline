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
      '<div class="tt-row"><span class="swatch swatch-prev"></span>Previous period<b>' + fmtNum.format(previous[i]) + "</b></div>" +
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

  // Keyboard: arrow keys step through days, Home/End jump to the ends.
  plot.addEventListener("keydown", function (e) {
    var i = last < 0 ? n - 1 : last;
    if (e.key === "ArrowRight") i = Math.min(n - 1, i + 1);
    else if (e.key === "ArrowLeft") i = Math.max(0, i - 1);
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = n - 1;
    else if (e.key === "Escape") { onLeave(); return; }
    else return;
    e.preventDefault();
    plot.classList.add("is-hovering");
    show(i);
  });
  plot.addEventListener("focus", function () {
    if (!plot.matches(":focus-visible")) return;
    plot.classList.add("is-hovering");
    show(n - 1);
  });
  plot.addEventListener("blur", onLeave);

  plot.addEventListener("mousemove", onMove);
  plot.addEventListener("mouseleave", onLeave);
  plot.addEventListener("touchstart", onMove, { passive: true });
  plot.addEventListener("touchmove", onMove, { passive: true });
  plot.addEventListener("touchend", onLeave);

  /* ---------- Date range menu ---------- */
  var rangeBtn = document.getElementById("rangeBtn");
  var rangeMenu = document.getElementById("rangeMenu");
  var rangeLabel = document.getElementById("rangeLabel");
  var rangeDates = document.getElementById("rangeDates");
  var options = Array.prototype.slice.call(rangeMenu.querySelectorAll('[role="option"]'));

  function openMenu() {
    rangeMenu.hidden = false;
    rangeBtn.setAttribute("aria-expanded", "true");
    var current = rangeMenu.querySelector('[aria-selected="true"]') || options[0];
    current.focus();
  }

  function closeMenu(returnFocus) {
    rangeMenu.hidden = true;
    rangeBtn.setAttribute("aria-expanded", "false");
    if (returnFocus) rangeBtn.focus();
  }

  function choose(opt) {
    options.forEach(function (o) { o.removeAttribute("aria-selected"); });
    opt.setAttribute("aria-selected", "true");
    rangeLabel.textContent = opt.dataset.label;
    if (opt.dataset.dates) rangeDates.textContent = opt.dataset.dates;
    closeMenu(true);
  }

  rangeBtn.addEventListener("click", function () {
    rangeMenu.hidden ? openMenu() : closeMenu(false);
  });

  rangeMenu.addEventListener("click", function (e) {
    var opt = e.target.closest('[role="option"]');
    if (opt) choose(opt);
  });

  rangeMenu.addEventListener("keydown", function (e) {
    var i = options.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); options[(i + 1) % options.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); options[(i - 1 + options.length) % options.length].focus(); }
    else if (e.key === "Home") { e.preventDefault(); options[0].focus(); }
    else if (e.key === "End") { e.preventDefault(); options[options.length - 1].focus(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i > -1) choose(options[i]); }
    else if (e.key === "Escape") { closeMenu(true); }
    else if (e.key === "Tab") { closeMenu(false); }
  });

  document.addEventListener("click", function (e) {
    if (!rangeMenu.hidden && !e.target.closest("#range")) closeMenu(false);
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
  var main = document.querySelector(".main");

  function setNav(open) {
    sidebar.classList.toggle("is-open", open);
    scrim.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    // While the drawer is open, the page behind it is out of reach.
    main.inert = open;
    if (open) {
      var current = sidebar.querySelector('[aria-current="page"]');
      if (current) current.focus();
    }
  }

  menuBtn.addEventListener("click", function () { setNav(!sidebar.classList.contains("is-open")); });
  scrim.addEventListener("click", function () { setNav(false); });
  // Widening past the drawer breakpoint closes it, so the page is never left inert.
  window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
    if (e.matches) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) { setNav(false); menuBtn.focus(); }
  });
})();
