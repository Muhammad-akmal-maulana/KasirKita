const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
    penjualan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'penjualan',
        required: true
    },
    produk_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'produk',
        required: true
    },
    jmlh_produk: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("detail", detailSchema);