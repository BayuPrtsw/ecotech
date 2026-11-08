// EcoTech - monitoring.js : dashboard sensor simulasi + kuis
(function () {
  /* =====================  DASHBOARD  ===================== */

  // ideal = [batas bawah, batas atas]; margin = jarak "kuning" di luar rentang ideal
  var SENSORS = [
    {
      id: "ph", name: "pH larutan", unit: "", min: 3, max: 9,
      ideal: [5.5, 6.5], margin: 0.5, decimals: 1, step: 0.15,
      low: "Terlalu asam: tambahkan larutan pH Up atau ganti larutan.",
      high: "Terlalu basa: tambahkan larutan pH Down."
    },
    {
      id: "suhu", name: "Suhu udara", unit: "°C", min: 10, max: 45,
      ideal: [18, 28], margin: 3, decimals: 1, step: 0.8,
      low: "Terlalu dingin: pertumbuhan melambat.",
      high: "Terlalu panas: beri naungan atau tambah ventilasi."
    },
    {
      id: "lembap", name: "Kelembapan udara", unit: "%", min: 20, max: 100,
      ideal: [50, 80], margin: 10, decimals: 0, step: 3,
      low: "Udara kering: tanaman cepat kehilangan air.",
      high: "Terlalu lembap: risiko jamur, tambah sirkulasi udara."
    },
    {
      id: "cahaya", name: "Intensitas cahaya", unit: "klux", min: 0, max: 80,
      ideal: [15, 40], margin: 8, decimals: 0, step: 4,
      low: "Cahaya kurang: nyalakan lampu tanam.",
      high: "Cahaya berlebih: pasang paranet."
    }
  ];

  var values = {};
  var host = document.getElementById("sensors");
  var summary = document.getElementById("summary");
  var cards = {};

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pct(s, v) { return ((clamp(v, s.min, s.max) - s.min) / (s.max - s.min)) * 100; }

  function statusOf(s, v) {
    if (v >= s.ideal[0] && v <= s.ideal[1]) return "ok";
    if (v >= s.ideal[0] - s.margin && v <= s.ideal[1] + s.margin) return "warn";
    return "bad";
  }

  var LABEL = { ok: "Ideal", warn: "Waspada", bad: "Tindakan" };

  function build() {
    SENSORS.forEach(function (s) {
      var card = document.createElement("article");
      card.className = "sensor ok";

      var zoneLeft = pct(s, s.ideal[0]);
      var zoneWidth = pct(s, s.ideal[1]) - zoneLeft;

      card.innerHTML =
        '<div class="name"></div>' +
        '<div><span class="value"></span> <span class="unit"></span></div>' +
        '<span class="pill ok"></span>' +
        '<div class="track"><div class="ideal-zone" style="left:' + zoneLeft + "%;width:" + zoneWidth + '%"></div><div class="dot"></div></div>' +
        '<div class="range"></div>' +
        '<p class="advice"></p>';

      card.querySelector(".name").textContent = s.name;
      card.querySelector(".unit").textContent = s.unit;
      card.querySelector(".range").textContent =
        "Ideal: " + s.ideal[0] + " sampai " + s.ideal[1] + (s.unit ? " " + s.unit : "");

      host.appendChild(card);
      cards[s.id] = card;
    });
  }

  function render() {
    var warn = 0, bad = 0;

    SENSORS.forEach(function (s) {
      var v = values[s.id];
      var st = statusOf(s, v);
      if (st === "warn") warn++;
      if (st === "bad") bad++;

      var card = cards[s.id];
      card.className = "sensor " + st;
      card.querySelector(".value").textContent = v.toFixed(s.decimals);
      card.querySelector(".pill").className = "pill " + st;
      card.querySelector(".pill").textContent = LABEL[st];
      card.querySelector(".dot").style.left = pct(s, v) + "%";

      var advice = "Kondisi baik. Tidak perlu tindakan.";
      if (st !== "ok") advice = v < s.ideal[0] ? s.low : s.high;
      card.querySelector(".advice").textContent = advice;
    });

    if (bad > 0) {
      summary.className = "summary bad";
      summary.textContent = bad + " parameter perlu tindakan segera" + (warn ? ", " + warn + " perlu diwaspadai." : ".");
    } else if (warn > 0) {
      summary.className = "summary warn";
      summary.textContent = warn + " parameter mendekati batas. Pantau terus.";
    } else {
      summary.className = "summary ok";
      summary.textContent = "Semua parameter dalam rentang ideal.";
    }
  }

  function setValues(v) {
    SENSORS.forEach(function (s) { values[s.id] = clamp(v[s.id], s.min, s.max); });
    render();
  }

  function midpoints() {
    var v = {};
    SENSORS.forEach(function (s) { v[s.id] = (s.ideal[0] + s.ideal[1]) / 2; });
    return v;
  }

  function randomValues() {
    var v = {};
    SENSORS.forEach(function (s) { v[s.id] = s.min + Math.random() * (s.max - s.min); });
    return v;
  }

  // data langsung: nilai bergeser sedikit tiap detik (random walk)
  var liveTimer = null;
  var liveBtn = document.getElementById("live");

  function stepLive() {
    var v = {};
    SENSORS.forEach(function (s) {
      v[s.id] = values[s.id] + (Math.random() - 0.5) * 2 * s.step;
    });
    setValues(v);
  }

  function stopLive() {
    if (liveTimer) clearInterval(liveTimer);
    liveTimer = null;
    liveBtn.textContent = "Mulai data langsung";
  }

  liveBtn.addEventListener("click", function () {
    if (liveTimer) { stopLive(); return; }
    liveBtn.textContent = "Hentikan data langsung";
    liveTimer = setInterval(stepLive, 1500);
  });

  document.getElementById("random").addEventListener("click", function () {
    stopLive();
    setValues(randomValues());
  });

  document.getElementById("sc-normal").addEventListener("click", function () {
    stopLive();
    setValues(midpoints());
  });

  document.getElementById("sc-ph").addEventListener("click", function () {
    stopLive();
    var v = midpoints();
    v.ph = 4.4;
    setValues(v);
  });

  document.getElementById("sc-panas").addEventListener("click", function () {
    stopLive();
    var v = midpoints();
    v.suhu = 35;
    v.cahaya = 3;
    setValues(v);
  });

  build();
  setValues(midpoints());

  /* =====================  KUIS  ===================== */

  var QUESTIONS = [
    {
      q: "Apa perbedaan utama hidroponik dan aeroponik?",
      options: [
        "Hidroponik memakai tanah, aeroponik tidak.",
        "Hidroponik: akar terendam atau dialiri larutan. Aeroponik: akar menggantung di udara dan dikabutkan larutan.",
        "Aeroponik memakai air laut, hidroponik memakai air tawar.",
        "Tidak ada perbedaan, keduanya sama."
      ],
      answer: 1,
      explain: "Keduanya tanpa tanah. Bedanya ada pada posisi akar dan cara larutan nutrisi sampai ke akar."
    },
    {
      q: "Pada sistem smart irrigation, apa fungsi sensor kelembapan tanah?",
      options: [
        "Menyiram tanaman secara langsung.",
        "Menambah nutrisi ke dalam tanah.",
        "Memberi data kondisi tanah ke pengendali yang memutuskan pompa ON atau OFF.",
        "Mengukur suhu pompa."
      ],
      answer: 2,
      explain: "Sensor hanya membaca. Keputusan diambil pengendali, dan pompa menjalankan aksinya."
    },
    {
      q: "Pada simulasi Smart Irrigation, pompa yang sedang menyala baru dimatikan saat kelembapan mencapai...",
      options: ["40%", "55%", "70%", "100%"],
      answer: 2,
      explain: "Pompa ON saat di bawah 40% dan baru OFF saat mencapai 70% atau lebih. Dua batas ini mencegah pompa hidup-mati berulang (histeresis)."
    },
    {
      q: "Rentang pH larutan nutrisi hidroponik yang umum dipakai adalah...",
      options: ["2 sampai 3", "8 sampai 9", "11 sampai 12", "5,5 sampai 6,5"],
      answer: 3,
      explain: "Pada pH sekitar 5,5 sampai 6,5 sebagian besar unsur hara mudah diserap akar."
    },
    {
      q: "Mengapa monitoring tanaman dengan sensor penting?",
      options: [
        "Agar kondisi tidak ideal terdeteksi dini dan bisa ditangani sebelum tanaman rusak.",
        "Agar tanaman tidak perlu lagi diberi air dan nutrisi.",
        "Agar petani tidak perlu mengecek kebun sama sekali.",
        "Agar tanaman tumbuh lebih besar dengan sendirinya."
      ],
      answer: 0,
      explain: "Sensor memberi data lebih cepat dan lebih objektif daripada mata. Petani tetap mengambil keputusan akhir."
    }
  ];

  var quizEl = document.getElementById("quiz");
  var scoreEl = document.getElementById("score");
  var retryBtn = document.getElementById("retry");
  var answered = 0;
  var correct = 0;

  function buildQuiz() {
    quizEl.innerHTML = "";
    scoreEl.textContent = "";
    retryBtn.hidden = true;
    answered = 0;
    correct = 0;

    QUESTIONS.forEach(function (item, qi) {
      var box = document.createElement("div");
      box.className = "q";

      var h = document.createElement("h3");
      h.textContent = (qi + 1) + ". " + item.q;
      box.appendChild(h);

      var opts = document.createElement("div");
      opts.className = "opts";
      var note = document.createElement("p");
      note.className = "explain";

      item.options.forEach(function (text, oi) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "opt";
        b.textContent = text;
        b.addEventListener("click", function () {
          var buttons = opts.querySelectorAll(".opt");
          buttons.forEach(function (x, xi) {
            x.disabled = true;
            if (xi === item.answer) x.classList.add("right");
          });
          if (oi === item.answer) {
            correct++;
            note.textContent = "Benar. " + item.explain;
          } else {
            b.classList.add("wrong");
            note.textContent = "Belum tepat. " + item.explain;
          }
          answered++;
          if (answered === QUESTIONS.length) finish();
        });
        opts.appendChild(b);
      });

      box.appendChild(opts);
      box.appendChild(note);
      quizEl.appendChild(box);
    });
  }

  function finish() {
    var total = QUESTIONS.length;
    var msg = correct === total
      ? "Sempurna."
      : correct >= 3 ? "Cukup baik, ulangi materi yang masih keliru." : "Pelajari lagi materinya, lalu coba kuis ini kembali.";
    scoreEl.textContent = "Skor: " + correct + " dari " + total + ". " + msg;
    retryBtn.hidden = false;
  }

  retryBtn.addEventListener("click", buildQuiz);
  buildQuiz();
})();
