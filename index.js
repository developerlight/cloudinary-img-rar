const express = require("express");
const cloudinary = require("cloudinary");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const app = express();

// Config Cloudinary
cloudinary.config({
  cloud_name: "dmsql45nn",
  api_key: "921162622775759",
  api_secret: "Pi2iydpeHWy6AD3GpyFqG-53u_Y",
  allowed_formats: ["jpg", "jpeg", "png", "zip", "rar"],
});

// Multer bisa di abaikan
const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err);
        cb(
          null,
          raw.toString("hex") + Date.now() + path.extname(file.originalname)
        );
      });
    },
  }),
  limits: {
    fieldSize: 5 * 1024 * 1024, // Batas ukuran file (5 MB)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/zip",
      "application/vnd.rar",
      "application/x-compressed",
      "application/x-zip-compressed",
    ];
    console.log(file.mimetype);
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Hanya gambar, ZIP, atau RAR yang diizinkan untuk diunggah")
      );
    }
  },
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", fileUpload.single("file"), async (req, res) => {
  try {
    const image = req.file;
    console.log("Uploading :", image.path);

    const result = await cloudinary.v2.uploader.upload(image.path, {
      resource_type: "auto",
    });

    console.log("Upload result:", result);

    // Dapatkan URL yang dioptimalkan dari hasil upload
    cloudinary.v2.url(result.public_id, {
      format: result.format,
      width: 100, // Sesuaikan dengan transformasi yang Anda terapkan di eager
      height: 100,
      crop: "thumb",
      secure: true, // Atur ke true jika menggunakan HTTPS
    });

    res.json({
      original_url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading image" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload.html"));
});

app.listen(3000, () => console.log("Listening on port http://localhost:3000"));
