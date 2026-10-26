(function () {
  "use strict";

  // Everything is converted to metres and seconds internally.
  var DISTANCE = {
    km:  { m: 1000,     label: "km",  name: "kilometres" },
    mi:  { m: 1609.344, label: "mi",  name: "miles" },
    m:   { m: 1,        label: "m",   name: "metres" },
    ft:  { m: 0.3048,   label: "ft",  name: "feet" },
    yd:  { m: 0.9144,   label: "yd",  name: "yards" },
    nmi: { m: 1852,     label: "nmi", name: "nautical miles" }
  };
  var SPEED = {
    kmh: { ms: 1 / 3.6,     label: "km/h", name: "kilometres per hour" },
    mph: { ms: 0.44704,     label: "mph",  name: "miles per hour" },
    ms:  { ms: 1,           label: "m/s",  name: "metres per second" },
    kn:  { ms: 1852 / 3600, label: "kn",   name: "knots" },
    fts: { ms: 0.3048,      label: "ft/s", name: "feet per second" }
  };

  var form = document.getElementById("calc");
  if (!form) return;

  var rows = {
    distance: form.querySelector('[data-row="distance"]'),
    time: form.querySelector('[data-row="time"]'),
    speed: form.querySelector('[data-row="speed"]')
  };
  var f = {
    distance: form.elements["distance"],
    distanceUnit: form.elements["distance-unit"],
    hours: form.elements["hours"],
    minutes: form.elements["minutes"],
    seconds: form.elements["seconds"],
    speed: form.elements["speed"],
    speedUnit: form.elements["speed-unit"]
  };
  var resultBox = document.getElementById("result");
  var errorBox = document.getElementById("calc-error");
  var triangle = document.getElementById("triangle");
  var solveFor = "speed";
  var hasResult = false;

  function num(input) {
    var v = input.value.trim().replace(",", ".");
    return v === "" ? NaN : Number(v);
  }

  function round(n, digits) {
    if (!isFinite(n)) return "—";
    var abs = Math.abs(n);
    var d = digits != null ? digits : abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 1 ? 2 : 4;
    return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: 0 });
  }

  function clock(totalSeconds) {
    var s = Math.round(totalSeconds);
    var days = Math.floor(s / 86400);
    s -= days * 86400;
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    var pad = function (x) { return (x < 10 ? "0" : "") + x; };
    return (days ? days + "d " : "") + h + ":" + pad(m) + ":" + pad(sec);
  }

  function pace(secondsPerUnit) {
    if (!isFinite(secondsPerUnit) || secondsPerUnit <= 0) return "—";
    var s = Math.round(secondsPerUnit);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    var pad = function (x) { return (x < 10 ? "0" : "") + x; };
    return (h ? h + ":" + pad(m) : m) + ":" + pad(sec);
  }

  function readTime() {
    var h = num(f.hours), m = num(f.minutes), s = num(f.seconds);
    if (isNaN(h) && isNaN(m) && isNaN(s)) return NaN;
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  }

  function setMode(mode) {
    solveFor = mode;
    var radio = form.querySelector('input[name="solve"][value="' + mode + '"]');
    if (radio) radio.checked = true;
    Object.keys(rows).forEach(function (key) {
      var solving = key === mode;
      rows[key].classList.toggle("is-solving", solving);
      rows[key].querySelectorAll("input").forEach(function (input) {
        input.disabled = solving;
        if (solving) input.value = "";
      });
    });
    if (triangle) triangle.setAttribute("data-solve", mode);
    clearError();
    resultBox.hidden = true;
    hasResult = false;
  }

  function showError(message, input) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
  }
  function clearError() {
    errorBox.hidden = true;
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) { el.removeAttribute("aria-invalid"); });
  }

  function calculate() {
    clearError();
    var meters = num(f.distance) * DISTANCE[f.distanceUnit.value].m;
    var seconds = readTime();
    var ms = num(f.speed) * SPEED[f.speedUnit.value].ms;

    if (solveFor !== "distance" && !(meters > 0)) return showError("Enter a distance greater than zero.", f.distance);
    if (solveFor !== "time" && !(seconds > 0)) return showError("Enter a time greater than zero. Hours, minutes or seconds is enough.", f.hours);
    if (solveFor !== "speed" && !(ms > 0)) return showError("Enter a speed greater than zero.", f.speed);

    if (solveFor === "speed") ms = meters / seconds;
    if (solveFor === "distance") meters = ms * seconds;
    if (solveFor === "time") seconds = meters / ms;

    render(meters, seconds, ms);
    return true;
  }

  function render(meters, seconds, ms) {
    var main, unitText, formula, rest = [];
    if (solveFor === "speed") {
      var su = SPEED[f.speedUnit.value];
      main = round(ms / su.ms);
      unitText = su.label;
      formula = "Speed = distance ÷ time";
      Object.keys(SPEED).forEach(function (k) {
        if (k !== f.speedUnit.value) rest.push([round(ms / SPEED[k].ms), SPEED[k].label]);
      });
    } else if (solveFor === "distance") {
      var du = DISTANCE[f.distanceUnit.value];
      main = round(meters / du.m);
      unitText = du.label;
      formula = "Distance = speed × time";
      Object.keys(DISTANCE).forEach(function (k) {
        if (k !== f.distanceUnit.value) rest.push([round(meters / DISTANCE[k].m), DISTANCE[k].label]);
      });
    } else {
      main = clock(seconds);
      unitText = "h:mm:ss";
      formula = "Time = distance ÷ speed";
      rest.push([round(seconds / 3600), "hours"]);
      rest.push([round(seconds / 60), "minutes"]);
      rest.push([round(seconds, 0), "seconds"]);
    }
    rest.push([pace(1000 / ms), "per km pace"]);
    rest.push([pace(1609.344 / ms), "per mile pace"]);

    resultBox.querySelector(".result-formula").textContent = formula;
    resultBox.querySelector(".result-value").textContent = main;
    resultBox.querySelector(".result-unit").textContent = unitText;
    resultBox.querySelector(".result-list").innerHTML = rest.map(function (r) {
      return "<li><b>" + r[0] + "</b> " + r[1] + "</li>";
    }).join("");
    resultBox.hidden = false;
    hasResult = true;
  }

  form.addEventListener("change", function (e) {
    if (e.target.name === "solve") setMode(e.target.value);
    else if (hasResult && (e.target === f.distanceUnit || e.target === f.speedUnit)) calculate();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (calculate()) {
      document.dispatchEvent(new CustomEvent("calculator:result"));
      if (window.matchMedia("(max-width: 720px)").matches) {
        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  });

  form.addEventListener("reset", function () {
    setTimeout(function () { setMode(solveFor); }, 0);
  });

  if (triangle) {
    triangle.querySelectorAll("[data-pick]").forEach(function (el) {
      el.addEventListener("click", function () { setMode(el.getAttribute("data-pick")); });
    });
  }

  // Worked-example buttons further down the page fill the form.
  document.querySelectorAll("[data-example]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ex = JSON.parse(btn.getAttribute("data-example"));
      setMode(ex.solve);
      if (ex.distance != null) { f.distance.value = ex.distance; f.distanceUnit.value = ex.distanceUnit; }
      if (ex.speed != null) { f.speed.value = ex.speed; f.speedUnit.value = ex.speedUnit; }
      if (ex.time != null) { f.hours.value = ex.time[0]; f.minutes.value = ex.time[1]; f.seconds.value = ex.time[2]; }
      if (ex.speedUnit && ex.speed == null) f.speedUnit.value = ex.speedUnit;
      if (ex.distanceUnit && ex.distance == null) f.distanceUnit.value = ex.distanceUnit;
      document.getElementById("calculator").scrollIntoView({ behavior: "smooth", block: "start" });
      calculate();
    });
  });

  setMode("speed");
})();
