const mongoose = require('mongoose');

const pelangganSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
    },
    alamat: {
        type: String,
        required: true,
    },
    telepon: {
        type: String,
        required: true,
    },
    akun: {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'pelanggan', 'petugas'],
            required: true
        }
    }
});

module.exports = mongoose.model("pelanggan", pelangganSchema);