const Keranjang = require('../models/keranjangModel');
const Produk = require('../models/produkModel');

const keranjangController = {
    tambahKeKeranjang: async (req, res) => {
        try {
            const produkId = req.params.id;
            const pelangganId = req.session.user.id;

            // Cek apakah produk sudah ada di keranjang user
            let item = await Keranjang.findOne({ pelanggan_id: pelangganId, produk_id: produkId });
            if (item) {
                item.jumlah += 1;
                await item.save();
            } else {
                item = new Keranjang({
                    pelanggan_id: pelangganId,
                    produk_id: produkId,
                    jumlah: 1
                });
                await item.save();
            }
            res.redirect('/pembelian/keranjang');
        } catch (error) {
            console.error("Error tambah ke keranjang:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    lihatKeranjang: async (req, res) => {
        try {
            const pelangganId = req.session.user.id;
            const items = await Keranjang.find({ pelanggan_id: pelangganId }).populate('produk_id');
            res.render('keranjang', {
                 items, 
                 user: req.session.user 
            });
        } catch (error) {
            console.error("Error lihat keranjang:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    deleteItemKeranjang: async (req, res) => {
        try {
            const itemId = req.params.id;
            await Keranjang.findByIdAndDelete(itemId);
            res.redirect('/pembelian/keranjang');
        } catch (error) {
            console.error("Error delete keranjang:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    checkoutKeranjang: async (req, res) => {
        try {
            const pelangganId = req.session.user.id;
            let checkedItems = req.body.checkedItems;
            if (!checkedItems) return res.redirect('/pembelian/keranjang');
            if (!Array.isArray(checkedItems)) checkedItems = [checkedItems];

            // Hitung total dan buat penjualan
            let total_harga = 0;
            let detailItems = [];
            for (let itemId of checkedItems) {
                const jumlah = parseInt(req.body[`jumlah_${itemId}`]) || 1;
                const item = await Keranjang.findById(itemId).populate('produk_id');
                if (!item || item.produk_id.stok < jumlah) continue;
                total_harga += item.produk_id.harga * jumlah;
                detailItems.push({ item, jumlah });
            }

            if (detailItems.length === 0) return res.redirect('/pembelian/keranjang');

            const Penjualan = require('../models/penjualanModel');
            const Detail = require('../models/detailPenjualanModel');
            const penjualan = new Penjualan({
                pelanggan_id: pelangganId,
                tgl_penjualan: new Date(),
                total_harga
            });
            await penjualan.save();

            for (const { item, jumlah } of detailItems) {
                await new Detail({
                    penjualan_id: penjualan._id,
                    produk_id: item.produk_id._id,
                    jmlh_produk: jumlah,
                    subtotal: item.produk_id.harga * jumlah
                }).save();

                // Kurangi stok produk
                item.produk_id.stok -= jumlah;
                await item.produk_id.save();
            }

            // Hapus item yang sudah di-checkout dari keranjang
            await Keranjang.deleteMany({ _id: { $in: checkedItems } });

            // Redirect ke halaman transaksi
            res.redirect(`/checkout/transaksi/${penjualan._id}`);
        } catch (error) {
            console.error("Error saat checkout:", error);
            res.status(500).send("Internal Server Error");
        }
    },
};

module.exports = keranjangController;