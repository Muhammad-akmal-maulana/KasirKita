const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-sidebar');
const body = document.body;
let sidebarVisible = false; // false = sembunyi dari awal

// Sembunyikan sidebar & atur padding body saat awal
sidebar.style.display = 'none';
body.style.paddingLeft = '80px';

toggleBtn.onclick = function () {
    sidebarVisible = !sidebarVisible;
    sidebar.style.display = sidebarVisible ? 'flex' : 'none';
    body.style.paddingLeft = sidebarVisible ? '335px' : '80px'; //330 lebar saat sidebar dibuka, 80 saat padding tutup
};