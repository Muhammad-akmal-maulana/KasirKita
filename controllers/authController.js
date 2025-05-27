const User = require('../models/pelangganModel');
const bcrypt = require('bcrypt');

const authController = {
    getRegister: (req, res) => {
        res.render('register', {
            user: req.session.user // <-- tambahkan ini
        });
    },
    getLogin: (req, res) => {
        res.render('login', {
            user: req.session.user // <-- tambahkan ini
        });
    },
    register: async (req, res) => { // register function
        try {
            const { nama, alamat, telepon, username, password } = req.body;

            // Cek apakah username sudah ada
            const existingUser = await User.findOne({ "akun.username": username });
            if (existingUser) {
                return res.status(400).send("Username sudah digunakan");
            }

            const existingTelepon = await User.findOne({ "akun.telepon": telepon });
            if (existingTelepon) {
                return res.status(400).send("Nomor telepon sudah digunakan");
            }

            // Hash password sebelum disimpan
            const hashedPassword = await bcrypt.hash(password, 10);

            // Buat user baru
            const newUser = new User({
                nama,
                alamat,
                telepon,
                akun: {
                    username,
                    password: hashedPassword,
                    role: 'pelanggan'
                }
            });

            await newUser.save();
            res.redirect('/auth/login');
        } catch (error) {
            console.error(error);
            res.status(500).send("Terjadi kesalahan saat registrasi");
        }
    },

    login: async (req, res) => { // login function
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ "akun.username": username });
            if (!user) {
                return res.status(400).send("Username atau password salah");
            }

            const validPassword = await bcrypt.compare(password, user.akun.password);
            if (!validPassword) {
                return res.status(400).send("Username atau password salah");
            }

            // Simpan data user di session
            req.session.user = {
                id: user.id,
                username: user.akun.username,
                role: user.akun.role
            };

            // diarahno sesuai role
            if (user.akun.role === "admin" || user.akun.role === "petugas") {
                res.redirect('/produk');
            } else if (user.akun.role === "pelanggan") {
                res.redirect('/produk/pelanggan');
            } else {
                res.redirect('/auth/login');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Terjadi kesalahan saat login");
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Gagal logout");
            }
            res.redirect('/auth/login');
        });
    },

}

module.exports = authController;