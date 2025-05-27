const mongoose = require('mongoose');

const keranjangSchema = new mongoose.Schema({
    pelanggan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pelanggan',
        required: true
    },
    produk_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'produk',
        required: true
    },
    jumlah: {
        type: Number,
        required: true,
        default: 1
    }
});

module.exports = mongoose.model("keranjang", keranjangSchema);