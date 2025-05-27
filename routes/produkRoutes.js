const produkController = require("../controllers/produkController");
const express = require("express");
const router = express.Router();
const checkSession = require("../middleware/checkSession");
const checkRole = require("../middleware/CheckRole");
const uploadImage = require("../middleware/uploadImage");

// cumah admin/petugas
router.get("/", checkSession, checkRole("admin", "petugas"), produkController.getDaftarProduk);

router.get("/tambah", checkSession, checkRole("admin", "petugas"), produkController.getTambahProduk);

router.get("/edit/:id", checkSession, checkRole("admin", "petugas"), produkController.getEditProduk);

router.post("/tambah", checkSession, checkRole("admin", "petugas"), uploadImage.single("foto"), produkController.tambahProduk);

router.post("/edit/:id", checkSession, checkRole("admin", "petugas"), uploadImage.single("foto"), produkController.editProduk);

router.post("/delete/:id", checkSession, checkRole("admin", "petugas"), produkController.deleteProduk);

// cumah pelanggan
router.get("/pelanggan", checkSession, checkRole("pelanggan"), produkController.getDaftarProdukPengguna);

module.exports = router;