const express = require("express");
const jwt = require("jsonwebtoken");
const Summary = require("../models/Summary");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.get("/", requireAuth, async (req, res) => {
  try {
    const history = await Summary.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch history" });
  }
});

module.exports = router;
