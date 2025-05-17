const express = require("express");
const cors = require("cors");
const uploadRoute = require("./routes/upload");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const historyRoute = require("./routes/history");
app.use("/api/history", historyRoute);



// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
app.use("/api/upload", uploadRoute);
app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});


// Server
const PORT = process.env.PORT || 5000;
const connectDB = require("./db");
connectDB(); // call it before app.listen()
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
});
