const fileInput = document.getElementById('foto');
const fileLabel = document.getElementById('custom-label');
const gambarProduk = document.getElementById('gambar-produk');
const labelContainer = fileLabel.parentElement;

window.addEventListener('DOMContentLoaded', function () {
    const src = gambarProduk.getAttribute('src');
    if (!src || src === '/img/' || src.endsWith('/undefined') || src.endsWith('/null')) {
        labelContainer.style.opacity = "1";
    } else {
        labelContainer.style.opacity = "0";
    }
});

fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            gambarProduk.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
        fileLabel.textContent = "Ganti Foto";
        labelContainer.style.opacity = "0";
    } else {
        gambarProduk.src = "";
        fileLabel.textContent = "Tambah Foto";
        labelContainer.style.opacity = "1";
    }
});