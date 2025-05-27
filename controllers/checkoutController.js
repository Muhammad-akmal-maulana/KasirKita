const Penjualan = require('../models/penjualanModel');
const Detail = require('../models/detailPenjualanModel');
const Produk = require('../models/produkModel');
const Keranjang = require('../models/keranjangModel');
const PDFDocument = require('pdfkit');

const checkoutController = {
    // GET detail transaksi
    getTransaksi: async (req, res) => {
        try {
            const penjualan = await Penjualan.findById(req.params.id);
            const details = await Detail.find({ penjualan_id: req.params.id }).populate('produk_id');
            if (!penjualan) return res.status(404).send('Transaksi tidak ditemukan');

            const items = details.map(detail => ({
                nama_produk: detail.produk_id.nama_produk,
                jumlah: detail.jmlh_produk,
                harga: detail.produk_id.harga
            }));

            res.render('transaksi', {
                transactionId: penjualan._id,
                totalAmount: penjualan.total_harga,
                items,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Terjadi kesalahan saat memuat detail checkout');
        }
    },

    // POST checkout (dari keranjang)
    postCheckout: async (req, res) => {
        try {
            const pelangganId = req.session.user.id;
            const keranjangItems = await Keranjang.find({ pelanggan_id: pelangganId }).populate('produk_id');
            if (!keranjangItems.length) return res.status(400).send('Keranjang kosong');

            let total_harga = 0;
            keranjangItems.forEach(item => {
                total_harga += item.produk_id.harga * item.jumlah;
            });

            const penjualan = new Penjualan({
                pelanggan_id: pelangganId,
                tgl_penjualan: new Date(),
                total_harga
            });
            await penjualan.save();

            for (const item of keranjangItems) {
                await new Detail({
                    penjualan_id: penjualan._id,
                    produk_id: item.produk_id._id,
                    jmlh_produk: item.jumlah,
                    subtotal: item.produk_id.harga * item.jumlah
                }).save();

                // Kurangi stok produk
                item.produk_id.stok -= item.jumlah;
                await item.produk_id.save();
            }

            // Hapus keranjang setelah checkout
            await Keranjang.deleteMany({ pelanggan_id: pelangganId });

            res.redirect(`/checkout/transaksi/${penjualan._id}`);
        } catch (error) {
            console.error('Error during checkout:', error);
            res.status(500).send('Checkout gagal');
        }
    },

    // GET download receipt PDF
    downloadReceipt: async (req, res) => {
        try {
            const penjualan = await Penjualan.findById(req.params.id);
            const details = await Detail.find({ penjualan_id: req.params.id }).populate('produk_id');
            if (!penjualan) return res.status(404).send('Transaksi tidak ditemukan');

            // Buat PDF
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receipt-${penjualan._id}.pdf`);
            doc.pipe(res);

            doc.fontSize(24).text('KASIR KITA', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(16).text('Struk Pembelian', { align: 'center' });
            doc.moveDown();

            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown();

            doc.fontSize(12);
            doc.text(`ID Transaksi : ${penjualan._id}`);
            doc.text(`Tanggal     : ${new Date(penjualan.tgl_penjualan).toLocaleString('id-ID')}`);
            doc.moveDown();

            // Header tabel
            let startX = 50;
            let startY = doc.y;
            let colWidth = { no: 30, nama: 250, jumlah: 60, harga: 80, total: 80 };

            doc.font('Helvetica-Bold');
            doc.text('No', startX, startY);
            doc.text('Nama Produk', startX + colWidth.no, startY);
            doc.text('Jumlah', startX + colWidth.no + colWidth.nama, startY, { width: colWidth.jumlah, align: 'right' });
            doc.text('Harga', startX + colWidth.no + colWidth.nama + colWidth.jumlah, startY, { width: colWidth.harga, align: 'right' });
            doc.text('Total', startX + colWidth.no + colWidth.nama + colWidth.jumlah + colWidth.harga, startY, { width: colWidth.total, align: 'right' });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown();

            // Isi tabel
            doc.font('Helvetica');
            let totalKeseluruhan = 0;
            details.forEach((detail, index) => {
                const y = doc.y;
                const total = detail.jmlh_produk * detail.produk_id.harga;
                totalKeseluruhan += total;

                doc.text((index + 1).toString(), startX, y);
                doc.text(detail.produk_id.nama_produk, startX + colWidth.no, y);
                doc.text(detail.jmlh_produk.toString(), startX + colWidth.no + colWidth.nama, y, { width: colWidth.jumlah, align: 'right' });
                doc.text(`Rp ${detail.produk_id.harga.toLocaleString('id-ID')}`, startX + colWidth.no + colWidth.nama + colWidth.jumlah, y, { width: colWidth.harga, align: 'right' });
                doc.text(`Rp ${total.toLocaleString('id-ID')}`, startX + colWidth.no + colWidth.nama + colWidth.jumlah + colWidth.harga, y, { width: colWidth.total, align: 'right' });
                doc.moveDown();
            });

            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown();

            doc.font('Helvetica-Bold');
            doc.text(
                `Total Keseluruhan: Rp ${totalKeseluruhan.toLocaleString('id-ID')}`,
                startX + colWidth.no + colWidth.nama,
                doc.y,
                { width: colWidth.jumlah + colWidth.harga + colWidth.total, align: 'right' }
            );
            doc.moveDown(2);

            doc.fontSize(10).font('Helvetica');
            doc.text('Terima kasih telah berbelanja di Kasir Kita', { align: 'center' });
            doc.text('Simpan struk ini sebagai bukti pembelian', { align: 'center' });

            doc.end();
        } catch (error) {
            console.error('Error generating receipt:', error);
            res.status(500).send('Terjadi kesalahan saat membuat struk');
        }
    },

    // Generate PDF daftar pembelian (riwayat)
    generatePDF: async (req, res) => {
        try {
            // Ambil semua penjualan dan detailnya
            const pembelianList = await Penjualan.find().populate('pelanggan_id');
            const detailList = await Detail.find().populate('produk_id penjualan_id');

            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=daftar_pembelian.pdf');
            doc.pipe(res);

            doc.fontSize(18).text('Daftar Pembelian', { align: 'center' });
            doc.moveDown();

            // Header tabel
            doc.fontSize(12);
            doc.text('No', 50, doc.y, { continued: true });
            doc.text('Nama Pembeli', 90, doc.y, { continued: true });
            doc.text('Nama Produk', 200, doc.y, { continued: true });
            doc.text('Tanggal', 320, doc.y, { continued: true });
            doc.text('Jumlah', 420, doc.y, { continued: true });
            doc.text('Subtotal', 480, doc.y);
            doc.moveDown(0.5);

            // Data tabel
            let no = 1;
            detailList.forEach((detail) => {
                const penjualan = pembelianList.find(p => p._id.equals(detail.penjualan_id._id));
                if (!penjualan) return;

                doc.text(no++, 50, doc.y, { continued: true });
                doc.text(
                    penjualan.pelanggan_id && penjualan.pelanggan_id.nama
                        ? penjualan.pelanggan_id.nama
                        : '-', 90, doc.y, { continued: true }
                );
                doc.text(detail.produk_id ? detail.produk_id.nama_produk : '-', 200, doc.y, { continued: true });
                doc.text(
                    penjualan.tgl_penjualan
                        ? new Date(penjualan.tgl_penjualan).toLocaleDateString('id-ID')
                        : '-', 320, doc.y, { continued: true }
                );
                doc.text(detail.jmlh_produk, 420, doc.y, { continued: true });
                doc.text('Rp ' + (detail.subtotal || 0).toLocaleString('id-ID'), 480, doc.y);
                doc.moveDown(0.5);
            });

            doc.end();
        } catch (err) {
            console.error(err);
            res.status(500).send('Gagal generate PDF');
        }
    },
};

module.exports = checkoutController;