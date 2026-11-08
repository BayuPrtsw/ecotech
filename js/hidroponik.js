// EcoTech - hidroponik.js : tab Hidroponik/Aeroponik + pemilih "mana yang cocok"
(function () {
  // ----- Tab -----
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".panel");

  function showTab(id) {
    tabs.forEach(function (t) {
      t.setAttribute("aria-selected", String(t.getAttribute("data-target") === id));
    });
    panels.forEach(function (p) {
      p.hidden = p.id !== id;
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      showTab(t.getAttribute("data-target"));
    });
  });

  // ----- Pemilih prioritas -----
  var answers = {
    pemula:
      "Pilih HIDROPONIK. Sistemnya sederhana (misalnya wick atau DWC) dan toleran terhadap kesalahan kecil. Aeroponik menuntut ketelitian nozzle dan pompa yang belum perlu kamu tangani di awal.",
    air:
      "Pilih AEROPONIK. Kabut nutrisi yang terkontrol umumnya paling hemat air dan nutrisi. Syaratnya: kamu siap dengan peralatan lebih mahal dan perawatan nozzle.",
    modal:
      "Pilih HIDROPONIK. Peralatannya lebih murah dan bisa dimulai dari bahan sederhana. Naik ke aeroponik nanti kalau kebutuhan dan anggaranmu sudah ada."
  };

  var result = document.getElementById("result");
  document.querySelectorAll("[data-pick]").forEach(function (b) {
    b.addEventListener("click", function () {
      result.textContent = answers[b.getAttribute("data-pick")];
    });
  });

  showTab("tab-hidro");
})();
