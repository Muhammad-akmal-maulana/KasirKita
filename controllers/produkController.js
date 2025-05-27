const Produk = require("../models/produkModel");
const path = require("path");
const fs = require("fs");

const produkController = {
    getDaftarProduk: async (req, res) => {
        try {
            const search = req.query.search || "";
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const query = search
                ? { nama_produk: { $regex: search, $options: "i" } }
                : {};

            const total = await Produk.countDocuments(query);
            const produkList = await Produk.find(query)
                .skip((page - 1) * limit)
                .limit(limit);

            res.render('daftarProduk', {
                produkList,
                user: req.session.user,
                search,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    getTambahProduk: (req, res) => {
        try {
            res.render('formTambahProduk', {
                user: req.session.user
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    tambahProduk: async (req, res) => {
        try {
            const { nama_produk, stok, harga } = req.body;
            const foto = req.file ? req.file.filename : '';

            if (!foto) {
                // Tampilkan pesan error ke user
                return res.status(400).send("Foto produk wajib diupload!");
            }

            const produkBaru = new Produk({
                foto: foto,
                nama_produk: nama_produk,
                stok: stok,
                harga: harga
            });

            await produkBaru.save();
            res.redirect('/produk');
        } catch (error) {
            console.error("Error adding books:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    getEditProduk: async (req, res) => {
        try {
            const produkId = req.params.id;
            const produk = await Produk.findById(produkId);
            res.render('formEditProduk', {
                produk,
                user: req.session.user
            });
        } catch (error) {
            console.error("Error fetching product:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    editProduk: async (req, res) => {
        try {
            const produkId = req.params.id;
            const { nama_produk, stok, harga } = req.body;
            const fotoPath = req.file ? req.file.filename : null;

            // Cari produk berdasarkan ID
            const produk = await Produk.findById(produkId);
            if (!produk) {
                return res.status(404).send("Produk tidak ditemukan");
            }

            if (fotoPath && produk.foto) {
                const oldImagePath = path.join(__dirname, './public/img', produk.foto);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Update hanya jika ada input baru, jika kosong tetap pakai nilai lama
            produk.nama_produk = nama_produk || produk.nama_produk;
            produk.stok = stok || produk.stok;
            produk.harga = harga || produk.harga;
            produk.foto = fotoPath || produk.foto;

            // Simpan perubahan
            await produk.save();
            res.redirect('/produk');
        } catch (error) {
            console.error("Error updating produk:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    deleteProduk: async (req, res) => {
        try {
            const produkId = req.params.id;
            const produk = await Produk.findById(produkId);
            const foto = req.file ? req.file.filename : '';

            if (!produk) {
                return res.status(404).send("Produk tidak ditemukan");
            }

            // Hapus gambar jika ada
            if (produk.foto) {
                const imagePath = path.join(__dirname, '../public/img', produk.foto);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Hapus produk dari database
            await Produk.findByIdAndDelete(produkId);

            res.redirect('/produk');
        } catch (error) {
            console.error("Error deleting produk:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    getDaftarProdukPengguna: async (req, res) => {
        try {
            const produkList = await Produk.find({ stok: { $gt: 0 } });
            res.render('daftarProdukPelanggan', {
                produklist: produkList,
                user: req.session.user
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).send("Internal Server Error");
        }
    },
};

module.exports = produkController;