const express = require('express');
const router = express.Router();
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/CheckRole');
const pembelianController = require('../controllers/pembelianController');
const keranjangController = require('../controllers/keranjangController');

// Hanya admin/petugas bisa lihat riwayat pembelian
router.get("/", checkSession, checkRole("admin", "petugas"), pembelianController.getPembelian);

// Pelanggan: keranjang, beli produk
router.get('/keranjang', checkSession, checkRole("pelanggan"), keranjangController.lihatKeranjang);

router.post('/keranjang/tambah/:id', checkSession, checkRole("pelanggan"), keranjangController.tambahKeKeranjang);

router.post('/keranjang/delete/:id', checkSession, checkRole("pelanggan"), keranjangController.deleteItemKeranjang);

router.post('/clear', checkSession, checkRole("admin", "petugas"), pembelianController.clearPembelian);

// Pembelian langsung oleh pelanggan
router.get('/beli/:id', checkSession, checkRole("pelanggan"), pembelianController.beliProduk);

router.post('/beli/:id', checkSession, checkRole("pelanggan"), pembelianController.beliProduk);

router.post('/keranjang/checkout', checkSession, checkRole("pelanggan"), keranjangController.checkoutKeranjang);

module.exports = router;