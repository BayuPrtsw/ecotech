// EcoTech - nav.js : menu dipakai semua halaman.
// Mau tambah/ubah menu? Cukup edit array "pages" di bawah.
(function () {
  var pages = [
    ["index.html", "Home"],
    ["hidroponik.html", "Hidroponik & Aeroponik"],
    ["irigasi.html", "Smart Irrigation"],
    ["monitoring.html", "Monitoring Tanaman"],
    ["profil.html", "Profil Pengembang"]
  ];

  var nav = document.getElementById("nav");
  if (!nav) return;

  // nama file halaman yang sedang dibuka
  var file = location.pathname.split("/").pop();
  if (!file) file = "index.html";                       // alamat berakhir "/"
  else if (file.indexOf(".") === -1) file += ".html";   // GitHub Pages kadang menghilangkan ".html"

  var html = '<strong class="brand">EcoTech</strong>';
  pages.forEach(function (p) {
    var cls = p[0] === file ? ' class="active" aria-current="page"' : "";
    html += '<a href="' + p[0] + '"' + cls + ">" + p[1] + "</a>";
  });
  nav.innerHTML = html;

  // geser menu agar tombol aktif terlihat di layar HP
  var active = nav.querySelector("a.active");
  if (active) nav.scrollLeft = Math.max(0, active.offsetLeft - 16);
})();
