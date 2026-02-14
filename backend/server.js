require("dotenv").config();

const express = require("express");

const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", authRoutes);


// Start Server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
