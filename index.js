const express = require('express');
const app = express();
const connectDB = require('./config/db');
const path = require('path');
const session = require('express-session'); // Pastikan hanya ada SATU baris ini
const pembelianRoutes = require('./routes/pembelianRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

require('dotenv').config();
const port = process.env.PORT;

const authRoutes = require('./routes/authRoutes');
const produkRoutes = require('./routes/produkRoutes');

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi session, hanya satu kali!
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60
    }
  })
);

app.use("/auth", authRoutes);
app.use("/produk", produkRoutes);
app.use("/pembelian", pembelianRoutes);
app.use('/checkout', checkoutRoutes);

app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});