const mongoose = require('mongoose');

const penjualanSchema = new mongoose.Schema({
    pelanggan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pelanggan',
        required: true
    },
    tgl_penjualan: {
        type: Date,
        default: true
    },
    total_harga: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("penjualan", penjualanSchema);