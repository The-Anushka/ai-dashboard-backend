const express = require("express");
const cors = require("cors");
const uploadRoute = require("./routes/upload");
const path = require("path");
const fs = require("fs");
const { router: authRoutes } = require("./routes/auth"); // ✅ FIXED
const historyRoute = require("./routes/history");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/upload", uploadRoute);
app.use("/api/auth", authRoutes); // ✅ FIXED
app.use("/api/history", historyRoute);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});

// Connect DB and Start Server
const PORT = process.env.PORT || 5000;
const connectDB = require("./db");
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
