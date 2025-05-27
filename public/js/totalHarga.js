document.addEventListener('DOMContentLoaded', function () {
    function hitungTotal() {
        let total = 0;
        document.querySelectorAll('.check-barang').forEach(function (checkbox) {
            if (checkbox.checked) {
                const harga = parseInt(checkbox.getAttribute('data-harga')) || 0;
                const id = checkbox.value;
                const jumlahInput = document.querySelector('input[name="jumlah_' + id + '"]');
                const jumlah = jumlahInput ? parseInt(jumlahInput.value) || 0 : 0;
                total += harga * jumlah;
            }
        });
        document.getElementById('total-harga').textContent = total.toLocaleString('id-ID');
    }

    // Event untuk checkbox dan input jumlah
    document.querySelectorAll('.check-barang').forEach(function (checkbox) {
        checkbox.addEventListener('change', hitungTotal);
    });
    document.querySelectorAll('.jumlah-barang').forEach(function (input) {
        input.addEventListener('input', hitungTotal);
    });

    // Hitung total pertama kali
    hitungTotal();
});