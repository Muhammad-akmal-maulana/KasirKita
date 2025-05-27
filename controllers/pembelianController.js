const Penjualan = require("../models/penjualanModel");
const Detail = require("../models/detailPenjualanModel");
const Produk = require("../models/produkModel");
const Pelanggan = require("../models/pelangganModel");

const pembelianController = {
    beliProduk: async (req, res) => {
        try {
            const produkId = req.params.id;
            const userId = req.session.user.id;
            const jumlah = parseInt(req.body.jumlah) || 1;

            // Cari produk
            const produk = await Produk.findById(produkId);
            if (!produk || produk.stok < jumlah) {
                return res.status(400).send("Produk tidak tersedia");
            }

            // Buat transaksi penjualan
            const penjualan = new Penjualan({
                pelanggan_id: userId,
                tgl_penjualan: new Date(),
                total_harga: produk.harga * jumlah
            });
            await penjualan.save();

            // Buat detail penjualan
            const detail = new Detail({
                penjualan_id: penjualan._id,
                produk_id: produk._id,
                jmlh_produk: jumlah,
                subtotal: produk.harga * jumlah
            });
            await detail.save();

            // Kurangi stok produk
            produk.stok -= jumlah;
            await produk.save();

            // Redirect ke halaman transaksi
            res.redirect(`/checkout/transaksi/${penjualan._id}`);
        } catch (error) {
            console.error("Error saat pembelian produk:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    getPembelian: async (req, res) => {
        try {
            // Ambil semua penjualan dan populate pelanggan & detail
            const penjualanList = await Penjualan.find()
                .populate('pelanggan_id')
                .lean();

            // Ambil detail untuk setiap penjualan
            for (let penjualan of penjualanList) {
                const detail = await Detail.findOne({ penjualan_id: penjualan._id }).populate('produk_id').lean();
                penjualan.detail = detail;
            }

            res.render('daftarPembelian', {
                pembelianList: penjualanList,
                user: req.session.user
            });
        } catch (error) {
            console.error("Error fetching pembelian:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    clearPembelian: async (req, res) => {
        try {
            await require('../models/detailPenjualanModel').deleteMany({});
            await require('../models/penjualanModel').deleteMany({});
            res.redirect('/pembelian');
        } catch (error) {
            console.error("Error clearing pembelian:", error);
            res.status(500).send("Gagal menghapus data pembelian");
        }
    },
};

module.exports = pembelianController;