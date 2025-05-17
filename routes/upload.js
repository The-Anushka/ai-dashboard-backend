const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const jwt = require("jsonwebtoken");
const Summary = require("../models/Summary");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Middleware to check token
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  const userId = req.userId;
  const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
  const dataBuffer = fs.readFileSync(filePath);

  try {
    const data = await pdfParse(dataBuffer);

    // Call Python API
    const axios = require("axios");
    const summaryRes = await axios.post("http://localhost:7000/api/summarize", {
      text: data.text,
    });

    const saved = await Summary.create({
      user: userId,
      filename: req.file.filename,
      extractedText: data.text,
      summary: summaryRes.data.summary,
    });

    res.status(200).json({
      message: "Summary saved",
      summary: summaryRes.data.summary,
      filename: saved.filename,
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing file" });
  }
});

module.exports = router;

