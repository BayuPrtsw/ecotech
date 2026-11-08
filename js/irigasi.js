// EcoTech - irigasi.js : simulasi sensor kelembapan -> pompa
(function () {
  var LOW = 40;   // di bawah ini pompa ON
  var HIGH = 70;  // di atas/sama dengan ini pompa OFF
  var START = 55;

  var slider = document.getElementById("moisture");
  var valueEl = document.getElementById("moistureVal");
  var pumpEl = document.getElementById("pump");
  var statusEl = document.getElementById("status");
  var fillEl = document.getElementById("fill");
  var autoBtn = document.getElementById("auto");
  var resetBtn = document.getElementById("reset");
  var rules = [
    document.getElementById("r1"),
    document.getElementById("r2"),
    document.getElementById("r3")
  ];

  var pumpOn = false;
  var timer = null;

  // inti logika: persis seperti yang tertulis di halaman
  function decide(m) {
    if (m < LOW) {
      pumpOn = true;
      return 0;            // aturan 1
    } else if (m >= HIGH) {
      pumpOn = false;
      return 1;            // aturan 2
    }
    return 2;              // aturan 3: pertahankan keadaan terakhir
  }

  function render() {
    var m = Number(slider.value);
    var rule = decide(m);

    valueEl.textContent = m;
    fillEl.style.height = m + "%";

    pumpEl.textContent = pumpOn ? "ON" : "OFF";
    pumpEl.className = "pump " + (pumpOn ? "on" : "off");

    rules.forEach(function (el, i) {
      el.className = i === rule ? "hl" : "";
    });

    if (rule === 0) {
      statusEl.textContent = "Tanah kering (di bawah " + LOW + "%). Pompa menyala.";
    } else if (rule === 1) {
      statusEl.textContent = "Tanah cukup basah (" + HIGH + "% atau lebih). Pompa dimatikan.";
    } else {
      statusEl.textContent = pumpOn
        ? "Di antara kedua batas. Pompa tetap menyala sampai mencapai " + HIGH + "%."
        : "Di antara kedua batas. Pompa tetap mati sampai turun di bawah " + LOW + "%.";
    }
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
    autoBtn.textContent = "Mulai simulasi otomatis";
  }

  function startAuto() {
    autoBtn.textContent = "Hentikan simulasi";
    timer = setInterval(function () {
      var m = Number(slider.value);
      // pompa ON: tanah makin basah. pompa OFF: tanah mengering (penguapan, diserap tanaman)
      m += pumpOn ? 3 : -2;
      m = Math.max(0, Math.min(100, m));
      slider.value = m;
      render();
    }, 400);
  }

  slider.addEventListener("input", render);

  autoBtn.addEventListener("click", function () {
    if (timer) stopAuto(); else startAuto();
  });

  resetBtn.addEventListener("click", function () {
    stopAuto();
    pumpOn = false;
    slider.value = START;
    render();
  });

  render();
})();
