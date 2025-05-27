const express = require('express');
const router = express.Router();
const checkSession = require('../middleware/checkSession');
const checkoutController = require('../controllers/checkoutController');

// GET detail transaksi
router.get('/transaksi/:id', checkSession, checkoutController.getTransaksi);

// POST checkout dari keranjang
router.post('/', checkSession, checkoutController.postCheckout);

// GET donlot receipt
router.get('/download-receipt/:id', checkSession, checkoutController.downloadReceipt);

// digawe donlot pdf
router.get('/generate/pdf', checkoutController.generatePDF);

module.exports = router;